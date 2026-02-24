"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mic, Copy, Globe, MessageSquare, Check, Clock, Upload, LinkIcon, AlertTriangle, Download } from "lucide-react"
import { FileUploader } from "@/components/upload/FileUploader"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TranscriptionTool() {
  const [audioUrl, setAudioUrl] = useState("")
  const [speechModel, setSpeechModel] = useState("")
  const [languageCode, setLanguageCode] = useState("")
  const [output, setOutput] = useState("")
  const [translatedOutput, setTranslatedOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [transcriptionTime, setTranscriptionTime] = useState<number | null>(null)
  const [translationTime, setTranslationTime] = useState<number | null>(null)
  const [inputMethod, setInputMethod] = useState<"upload" | "url">("upload") // 默认为上传模式
  const [copied, setCopied] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [srtContent, setSrtContent] = useState<string>("")
  const [vttContent, setVttContent] = useState<string>("")
  const [darkMode, setDarkMode] = useState(false)

  // 暗色模式还没做orzzzzz
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioUrl) {
      alert("请输入音频链接或上传文件")
      return
    }

    setLoading(true)
    setOutput("")
    setTranslatedOutput("")
    setTranslationError(null)
    setTranscriptionError(null)
    setShowTranslation(false)
    setTranscriptionTime(null)
    setSrtContent("")
    setVttContent("")
    setTranslationTime(null)

    try {
      console.log("Starting transcription with URL:", audioUrl)
      const startTime = Date.now()

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl, speechModel, languageCode }),
      })

      // 检查HTTP状态
      if (!res.ok) {
        let errorMessage = `转录请求失败: ${res.status} ${res.statusText}`

        try {
          const errorData = await res.json()
          if (errorData && errorData.error) {
            errorMessage = errorData.error
          }
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError)
        }

        throw new Error(errorMessage)
      }

      // 解析响应JSON
      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError)
        throw new Error("服务器返回了无效的响应格式")
      }

      if (!data.success) {
        throw new Error(data.error || "转录失败")
      }

      setOutput(data.text || "无转录内容")
      if (data.srt) setSrtContent(data.srt)
      if (data.vtt) setVttContent(data.vtt)
      const endTime = Date.now()
      setTranscriptionTime((endTime - startTime) / 1000)
    } catch (error: any) {
      console.error("Transcription error:", error)
      setTranscriptionError(error.message)
      setOutput("")
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!output) return
    setTranslating(true)
    setTranslationError(null)
    setTranslationTime(null)

    try {
      const startTime = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 改成新的 5分钟（300秒）
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: output }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查HTTP状态
      if (!res.ok) {
        let errorMessage = `翻译请求失败: ${res.status} ${res.statusText}`

        try {
          const errorData = await res.json()
          if (errorData && errorData.error) {
            errorMessage = errorData.error
          }
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError)
        }

        throw new Error(errorMessage)
      }

      // 解析响应JSON
      let result
      try {
        result = await res.json()
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError)
        throw new Error("服务器返回了无效的响应格式")
      }

      setTranslatedOutput(result.translation)
      const endTime = Date.now()
      setTranslationTime((endTime - startTime) / 1000)
      setShowTranslation(true)
    } catch (err: any) {
      if (err.name === "AbortError") {
        setTranslationError("翻译请求超时")
      } else {
        setTranslationError(err.message)
      }
      setShowTranslation(true)
    } finally {
      setTranslating(false)
    }
  }

  const toggleTranslation = async () => {
    if (!translatedOutput && !translating && output) {
      await handleTranslate()
    } else {
      setShowTranslation(!showTranslation)
    }
  }

  const copyText = async () => {
    try {
      const text = showTranslation ? translatedOutput : output
      await navigator.clipboard.writeText(text || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  const downloadSubtitle = (content: string, format: "srt" | "vtt") => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subtitle.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (url: string) => {
    console.log("File uploaded, setting URL:", url)
    setAudioUrl(url)
  }

  const displayedText = showTranslation ? (
    translationError || translatedOutput || "翻译内容待生成..."
  ) : transcriptionError ? (
    <div className="flex items-center text-red-500">
      <AlertTriangle className="w-4 h-4 mr-2" />
      {transcriptionError}
    </div>
  ) : (
    output || "转录内容将显示在这里..."
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('none')" }}
    >
      <div className="glass-card p-8 rounded-2xl max-w-3xl w-full relative overflow-hidden backdrop-blur-xl border border-white/20 dark:border-gray-800/30 shadow-xl">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-blue-300 opacity-10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-300 opacity-10 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI音频转文字&翻译工具</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
            Powered by AssemblyAI
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <Button
                  type="button"
                  onClick={() => setInputMethod("upload")}
                  variant={inputMethod === "upload" ? "primary" : "secondary"}
                  className="flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
                <Button
                  type="button"
                  onClick={() => setInputMethod("url")}
                  variant={inputMethod === "url" ? "primary" : "secondary"}
                  className="flex items-center"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  输入链接
                </Button>
              </div>

              {inputMethod === "upload" ? (
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-gray-700/20">
                  <FileUploader onFileUpload={handleFileUpload} />
                  {audioUrl && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">已上传文件链接:</p>
                      <div className="flex items-center">
                        <Input value={audioUrl} readOnly className="text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">音频链接</label>
                  <Input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="输入音频链接（仅支持 github raw 链接）"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">转录模型</label>
                <Select value={speechModel} onChange={(e) => setSpeechModel(e.target.value)}>
                  <option value="" disabled>🌟 请选择转录模型</option>
                  <option value="best">最佳质量[best]推荐用于音质复杂or多人对话</option>
                  <option value="nano">快速响应[nano]适用于清晰录音orASMR</option>
                </Select>

              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">源语言</label>
                <Select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}>
                  <option value="" disabled>🌐 请选择语言</option>

                  <optgroup label="✨ 便捷选项">
                    <option value="ALD">自动语言检测</option>
                  </optgroup>

                  <optgroup label="🌏 亚洲语系">
                    <option value="zh">中文（普通话，简体）</option>
                    <option value="ja">日语</option>
                    <option value="ko">韩语</option>
                    <option value="hi">印地语</option>
                    <option value="vi">越南语</option>
                  </optgroup>

                  <optgroup label="🗣️ 英语大系列">
                    <option value="en">英语（全球）</option>
                    <option value="en_us">英语（美国）</option>
                    <option value="en_au">英语（澳大利亚）</option>
                    <option value="en_uk">英语（英国）</option>
                  </optgroup>

                  <optgroup label="🇪🇺 欧洲语言">
                    <option value="fr">法语</option>
                    <option value="de">德语</option>
                    <option value="es">西班牙语</option>
                    <option value="it">意大利语</option>
                    <option value="pt">葡萄牙语</option>
                    <option value="nl">荷兰语</option>
                    <option value="pl">波兰语</option>
                    <option value="fi">芬兰语</option>
                    <option value="uk">乌克兰语</option>
                    <option value="ru">俄语</option>
                  </optgroup>

                  <optgroup label="🌍 中东与其他">
                    <option value="tr">土耳其语</option>
                  </optgroup>
                </Select>

              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || !audioUrl}
              className="w-full py-4 rounded-xl flex items-center justify-center font-medium"
            >
              {!loading && <Mic className="h-5 w-5 mr-2" />}
              {loading ? "转录中..." : "开始转录"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {showTranslation ? "翻译内容" : "转录结果"}
                </h2>
                {transcriptionTime !== null && !showTranslation && (
                  <Badge variant="outline" className="ml-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {transcriptionTime.toFixed(1)}秒
                  </Badge>
                )}
                {translationTime !== null && showTranslation && (
                  <Badge variant="outline" className="ml-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {translationTime.toFixed(1)}秒
                  </Badge>
                )}
              </div>

              {output && (
                <div className="flex gap-2">
                  <Button
                    onClick={toggleTranslation}
                    isLoading={translating}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    {!translating && (
                      <>
                        {showTranslation ? (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        ) : (
                          <Globe className="h-3 w-3 mr-1" />
                        )}
                      </>
                    )}
                    {translating ? "翻译中..." : showTranslation ? "查看原文" : "翻译"}
                  </Button>
                  <Button
                    onClick={copyText}
                    variant="secondary"
                    size="sm"
                    className={cn("text-xs transition-all", {
                      "bg-green-500/20 text-green-700 dark:text-green-300": copied,
                    })}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                  {srtContent && (
                    <Button
                      onClick={() => downloadSubtitle(srtContent, "srt")}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      SRT
                    </Button>
                  )}
                  {vttContent && (
                    <Button
                      onClick={() => downloadSubtitle(vttContent, "vtt")}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      VTT
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="result-box p-6 rounded-xl text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-inner min-h-[200px] max-h-[400px] overflow-auto">
              {displayedText}
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8 space-y-1">
            <p>Love From Kirenath & Elias</p>
            <p>
              <a
                href="mailto:kirenath@tuta.io"
                className="inline-flex items-center gap-1 hover:text-blue-500 transition"
                title="发邮件联系我 💌"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m0 0A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25zm0 0l9.75 6.5 9.75-6.5"
                  />
                </svg>
                kirenath@tuta.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

