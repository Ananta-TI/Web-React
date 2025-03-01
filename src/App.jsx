import { ThemeProvider } from "./components/ThemeContext";
import Header from "./components/header";
import Hero from "./components/hero";
import Hero2 from "./components/TextPressure";
import About from "./components/about";
import CursorEffect from "./components/CursorEffect";
import GithubGraph from "./components/GithubGraph";
import './index.css';

function App() {
  return (
    <ThemeProvider>
     <CursorEffect />
      <Header />
      <Hero />
      <Hero2 />
      <About />
    </ThemeProvider>
  );
}

export default App;
