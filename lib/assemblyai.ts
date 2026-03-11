// AssemblyAI API 相关函数 (含时间戳打印)
// AssemblyAI API KEY 在 .env.local 内修改

export async function transcribeAudio(audioUrl: string, apiKey: string, speechModel = "best", languageCode = "zh") {
  try {
    console.log(`🚀 Starting transcription for: ${audioUrl}`)
    console.log(`🛠️ Using model: ${speechModel}, language: ${languageCode}`)

    // 创建转录任务
    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_model: speechModel,
        language_code: languageCode,
      }),
    })

    if (!transcriptRes.ok) {
      const errorData = await transcriptRes.json().catch(() => ({}))
      console.error("❌ AssemblyAI API error:", errorData)
      throw new Error(`API请求失败: ${transcriptRes.status} ${transcriptRes.statusText}`)
    }

    const transcriptData = await transcriptRes.json()

    if (transcriptData.error) {
      console.error("❌ AssemblyAI returned an error:", transcriptData.error)
      throw new Error(`AssemblyAI错误: ${transcriptData.error}`)
    }

    const transcriptId = transcriptData.id
    console.log(`✅ Transcript ID: ${transcriptId}`)

    // 轮询获取结果
    let completed = false
    let result
    let attempts = 0
    const maxAttempts = 200;  // 最多轮询 200 次，每次间隔 3 秒 ≈ 最长等候 10 分钟

    while (!completed && attempts < maxAttempts) {
      attempts++
      await new Promise((res) => setTimeout(res, 3000))
      console.log(`🔄 Polling attempt ${attempts} / ${maxAttempts} for transcript ${transcriptId}`)

      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: apiKey },
      })

      if (!pollRes.ok) {
        throw new Error(`获取转录结果失败: ${pollRes.status} ${pollRes.statusText}`)
      }

      result = await pollRes.json()
      console.log(`🧩 Transcript status: ${result.status}`)

      if (result.status === "completed") {
        completed = true
      } else if (result.status === "error") {
        throw new Error(result.error || "转录过程中出现错误")
      }
    }

    if (!completed) {
      throw new Error("🚨 转录超时，请稍后再试")
    }

    //打印句子级别 (segments) 时间戳
    if (result.segments && Array.isArray(result.segments)) {
      console.log("\n📚 句子时间戳：")
      result.segments.forEach((segment: any, index: number) => {
        const start = (segment.start / 1000).toFixed(2)
        const end = (segment.end / 1000).toFixed(2)
        console.log(`【${start}s - ${end}s】${segment.text}`)
      })
    } else {
      console.log("⚠️ 没有提供 segments 时间戳")
    }

    //打印首10个单词(逐词)的时间戳
    if (result.words && Array.isArray(result.words)) {
      console.log("\n✏️ 单词逐个时间戳(前10个):")
      result.words.slice(0, 10).forEach((word: any) => {
        const wStart = (word.start / 1000).toFixed(2)
        const wEnd = (word.end / 1000).toFixed(2)
        console.log(`【${wStart}s - ${wEnd}s】${word.text}`)
      })
    } else {
      console.log("⚠️ 没有提供 words 逐词时间戳")
    }

    // 获取 SRT 和 VTT 字幕
    console.log("📝 正在获取字幕文件...")

    const [srtRes, vttRes] = await Promise.all([
      fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}/srt`, {
        headers: { authorization: apiKey },
      }),
      fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}/vtt`, {
        headers: { authorization: apiKey },
      }),
    ])

    const srtContent = srtRes.ok ? await srtRes.text() : ""
    const vttContent = vttRes.ok ? await vttRes.text() : ""

    if (srtContent) console.log("✅ SRT 字幕获取成功")
    if (vttContent) console.log("✅ VTT 字幕获取成功")

    // 最终返回结果
    return {
      success: true,
      text: result.text || "无转录内容",
      duration: result.audio_duration,
      transcriptId,
      srt: srtContent,
      vtt: vttContent,
    }
  } catch (error) {
    console.error("❗ Transcription function error:", error)
    throw error
  }
}