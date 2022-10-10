import { ReactNode } from "react"

export default function Grid({ children, columns }: { children: ReactNode; columns: number }) {
  return (
    <div
      className="inline-block"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridGap: 10,
        padding: 10,
      }}
    >
      {children}
    </div>
  )
}
