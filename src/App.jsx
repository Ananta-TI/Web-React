import { ThemeProvider } from "./context/ThemeContext";
import Header from "./layouts/header";
import Footer from "./layouts/footer";
import Hero from "./components/Home/hero";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import CursorEffect from "./components/Shared/CursorEffect";
import TargetCursor from "./components/Shared/TargetCursor";
import GithubGraph from "./components/GithubGraph";
import './index.css';
import './assets/tailwind.css';

function App() {
  return (
    
    <ThemeProvider>
     <TargetCursor 
        spinDuration={4.1}
        hideDefaultCursor={true}
      />
      <Header />
      <Hero />
      <Hero2 />
      <About />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
