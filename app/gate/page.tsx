'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function GatePage() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    if (!key.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || '密钥无效')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('网络错误，请重试')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="gate-page">
      {/* 背景装饰光斑 - 与主页一致 */}
      <div className="gate-bg-orb gate-bg-orb-1" />
      <div className="gate-bg-orb gate-bg-orb-2" />

      <div className={`gate-card ${shake ? 'gate-shake' : ''}`}>
        {/* 卡片内装饰光斑 - 与主页 glass-card 一致 */}
        <div className="gate-card-orb gate-card-orb-1" />
        <div className="gate-card-orb gate-card-orb-2" />

        <div className="gate-content">
          {/* Logo / 标题 */}
          <div className="gate-header">
            <div className="gate-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <h1 className="gate-title">AI音频转文字&翻译工具</h1>
            <p className="gate-subtitle">请输入访问密钥以继续</p>
          </div>

          {/* 输入区域 */}
          <form onSubmit={handleSubmit} className="gate-form">
            <div className="gate-input-wrapper">
              <div className="gate-input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="access-key-input"
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  if (error) setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="Access Key"
                autoFocus
                autoComplete="off"
                className="gate-input"
              />
            </div>

            {error && (
              <div className="gate-error">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="gate-button"
            >
              {loading ? (
                <div className="gate-spinner" />
              ) : (
                '进入'
              )}
            </button>
          </form>

          {/* 底部信息 - 与主页 footer 一致 */}
          <div className="gate-footer">
            <p>Love From Kirenath & Elias</p>
          </div>

          {/* 免责声明 */}
          <div className="gate-disclaimer">
            <p className="gate-disclaimer-title">免责声明：</p>
            <p>本工具仅供个人学习与技术研究使用</p>
            <p>因使用本工具产生的任何内容及后果，由使用者自行承担。</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gate-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 背景光斑 - 与主页 page.tsx 的装饰风格一致 */
        .gate-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .gate-bg-orb-1 {
          width: 500px;
          height: 500px;
          background: rgba(147, 130, 246, 0.12);
          top: -150px;
          right: -100px;
        }

        .gate-bg-orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(59, 130, 246, 0.1);
          bottom: -120px;
          left: -100px;
        }

        /* 卡片 - 与主页 glass-card 风格一致 */
        .gate-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          z-index: 1;
          overflow: hidden;
        }

        /* 卡片内装饰光斑 - 与主页 glass-card 内的装饰一致 */
        .gate-card-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(3rem);
          pointer-events: none;
        }

        .gate-card-orb-1 {
          width: 16rem;
          height: 16rem;
          background: rgba(147, 197, 253, 0.3);
          top: -8rem;
          right: -8rem;
          opacity: 0.1;
        }

        .gate-card-orb-2 {
          width: 16rem;
          height: 16rem;
          background: rgba(196, 181, 253, 0.3);
          bottom: -8rem;
          left: -8rem;
          opacity: 0.1;
        }

        .gate-content {
          position: relative;
          z-index: 10;
        }

        .gate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }

        .gate-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .gate-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1));
          color: #3b82f6;
          margin-bottom: 0.75rem;
        }

        .gate-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .gate-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .gate-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .gate-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gate-input-icon {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          display: flex;
          pointer-events: none;
          z-index: 2;
        }

        /* 与主页 glass-input 风格一致 */
        .gate-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.625rem;
          outline: none;
          transition: all 0.2s ease;
          letter-spacing: 0.08em;
          font-family: inherit;
        }

        .gate-input::placeholder {
          color: #9ca3af;
          letter-spacing: 0.04em;
        }

        .gate-input:focus {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }

        .gate-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: #dc2626;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.12);
          border-radius: 0.5rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 与主页 btn-primary 风格一致 */
        .gate-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
          border: none;
          border-radius: 0.625rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          font-family: inherit;
        }

        .gate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .gate-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .gate-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .gate-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gate-footer {
          text-align: center;
          margin-top: 1.5rem;
        }

        .gate-footer p {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        .gate-disclaimer {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .gate-disclaimer p {
          font-size: 0.6875rem;
          line-height: 1.6;
          color: #b0b7c3;
          margin: 0;
          text-align: center;
        }

        .gate-disclaimer-title {
          font-weight: 600;
          color: #9ca3af !important;
          margin-bottom: 0.25rem !important;
        }
      `}</style>
    </div>
  )
}
