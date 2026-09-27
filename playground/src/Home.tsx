import { AiPromptSection } from './home/AiPromptSection';
import { CtaBand } from './home/CtaBand';
import { DeveloperSection } from './home/DeveloperSection';
import { FaqSection } from './home/FaqSection';
import { FeaturesSection } from './home/FeaturesSection';
import { FeedbackSection } from './home/FeedbackSection';
import { HeroSection } from './home/HeroSection';
import { HomeFooter } from './home/HomeFooter';
import { HomeNav } from './home/HomeNav';
import { MenusSection } from './home/MenusSection';
import { QuickStartSection } from './home/QuickStartSection';
import { StackStrip } from './home/StackStrip';
import './home/home.css';

export interface HomeProps {
  onToggleTheme: () => void;
  dark: boolean;
}

export function Home({ onToggleTheme, dark }: HomeProps) {
  return (
    <div className="lp">
      <HomeNav dark={dark} onToggleTheme={onToggleTheme} />
      <main>
        <HeroSection dark={dark} />
        <StackStrip />
        <QuickStartSection />
        <AiPromptSection />
        <FeaturesSection />
        <MenusSection />
        <DeveloperSection />
        <FaqSection />
        <FeedbackSection />
        <CtaBand />
      </main>
      <HomeFooter />
    </div>
  );
}
