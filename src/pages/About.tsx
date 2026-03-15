import { MdArrowBack, MdOpenInNew } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'
import { BackButton } from '../styles/SharedStyles'
import { AboutContainer, AppInfo, AppLogo, AppName, AppVersion, LinksSection, LinkItem } from '../styles/pages.styles'

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

interface AboutProps {
  onBack: () => void
}

const STORE_URL = isFirefox
  ? 'https://addons.mozilla.org/en-US/firefox/addon/qwacky/'
  : 'https://chromewebstore.google.com/detail/qwacky/kieehbhdbincplacegpjdkoglfakboeo'

export const About = ({ onBack }: AboutProps) => {
  return (
    <AboutContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        Back
      </BackButton>

      <AppInfo>
        <AppLogo src="/assets/icons/qwacky.png" alt="Qwacky" />
        <AppName>Qwacky</AppName>
        <AppVersion>v1.2.1</AppVersion>
      </AppInfo>

      <LinksSection>
        <LinkItem href="https://github.com/Lanshuns/Qwacky" target="_blank" rel="noopener noreferrer">
          <FaGithub size={20} />
          GitHub Repository
          <MdOpenInNew size={16} />
        </LinkItem>
        <LinkItem href={STORE_URL} target="_blank" rel="noopener noreferrer">
          <MdOpenInNew size={20} />
          {isFirefox ? 'Firefox Add-ons' : 'Chrome Web Store'}
          <MdOpenInNew size={16} />
        </LinkItem>
      </LinksSection>
    </AboutContainer>
  )
}
