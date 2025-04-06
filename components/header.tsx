import type React from "react"

interface HeaderProps {
  title?: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const defaultTitle = "やさしいメンタリング"

  return (
    <header>
      <h1>{title || defaultTitle}</h1>
    </header>
  )
}

export default Header

