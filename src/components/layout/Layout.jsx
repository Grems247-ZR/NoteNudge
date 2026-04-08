/**
 * Layout.jsx — 全局布局容器
 *
 * 包裹 Header + 主内容区域，统一处理最大宽度、内边距等。
 */

import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-base text-text-primary font-sans antialiased">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}
