import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Next Todo App",
  description: "Simple Todo List built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header>
            <h1>Todo List</h1>
          </header>
          <main>{children}</main>
          <footer>
            <small>Built with Next.js</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
