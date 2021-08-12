import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import { NextSeo } from 'next-seo'
import classNames from 'classnames'
import { bundleMDX } from 'mdx-bundler'
import { getMDXComponent } from 'mdx-bundler/client'

import { useIntersectionObserver } from '../libs/use-intersection-observer'

const NAV_BAR_PADDING_PX = 60
const INTERSECTION_OBSERVER_OFFSET = 4

export async function getStaticProps() {
  const { code: aboutMeCode } = await bundleMDX('', {
    esbuildOptions: (options) => {
      options.entryPoints = ['../data/index/about-me.mdx']

      return options
    },
  })

  return {
    props: {
      aboutMeCode: aboutMeCode,
    },
  }
}

export default function Home({ aboutMeCode }) {
  const AboutMe = useMemo(() => {
    return getMDXComponent(aboutMeCode)
  }, [aboutMeCode])
  const [isFixedNavBarVisible, setIsFixedNavBarVisible] = useState(false)
  const handleFixedNavBarEnter = useCallback(() => {
    setIsFixedNavBarVisible(true)
  }, [])
  const handleFixedNavBarExit = useCallback(() => {
    setIsFixedNavBarVisible(false)
  }, [])
  const fixedNavBarRef = useIntersectionObserver({
    onEnter: handleFixedNavBarEnter,
    onExit: handleFixedNavBarExit,
    margin: `${NAV_BAR_PADDING_PX * 1.5}px`,
  })

  const [sectionVisibilities, setSectionVisibilities] = useState({
    'about-me': false,
    skills: false,
    projects: false,
    contact: false,
    end: false,
  })

  const activeSection = computeActiveSection(sectionVisibilities)

  const handleSectionEnter = useCallback(
    function handleSectionEnter(sectionId: string) {
      setSectionVisibilities((sectionVisibilities) => {
        return {
          ...sectionVisibilities,
          [sectionId]: true,
        }
      })
    },
    []
  )

  const handleSectionExit = useCallback(
    function handleSectionExit(sectionId: string) {
      setSectionVisibilities((sectionVisibilities) => {
        return {
          ...sectionVisibilities,
          [sectionId]: false,
        }
      })
    },
    []
  )
  return (
    <>
      <NextSeo
        title="Bboykelvin.dev"
        description="Hi, I'm kelvin am a passionate web developers who like solving problems and write clean and maintainable code."
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
        ]}
      />
      <NavBar activeSection={activeSection} hidden={isFixedNavBarVisible} isSticky />
      <NavBar ref={fixedNavBarRef} activeSection={activeSection} />
      <div className="">
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="about-me"
          className="mdx"
        >
          <NavBarBackground
            className={classNames('bg-white transition', {
              '-translate-y-full': isFixedNavBarVisible,
              // '': !hidden,
            })}
          />
          <div className="max-w-2xl mx-auto">
            <AboutMe />
          </div>
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="skills"
          className="bg-blue-400"
        >
          <NavBarBackground className="bg-blue-400" />
          Skills
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="projects"
          className="bg-green-400"
        >
          <NavBarBackground className="bg-green-400" />
          Projects
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="contact"
          className="bg-purple-400"
        >
          <NavBarBackground className="bg-purple-400" />
          Contact
        </Section>
        {/* This made sure last-of-type selector works so I use different element than what Section renders (div) */}
        <span aria-hidden>
          <Section onEnter={handleSectionEnter} onExit={handleSectionExit} id="end" last></Section>
        </span>
      </div>
    </>
  )
}

type NavBarProps = {
  activeSection: keyof SectionVisibility
  isSticky?: boolean
  hidden?: boolean
  className?: string
}
const NavBar = forwardRef(
  function NavBar({ activeSection, className, hidden, isSticky }: NavBarProps, ref: any) {
    return (
      <nav
        ref={ref}
        aria-hidden={hidden}
        className={classNames('w-full px-8 py-4 text-xl top-0 z-10', className, {
          'fixed transition': isSticky,
          absolute: !isSticky,
          '-translate-y-full': hidden,
        })}
      >
        <ul className="flex flex-row list-none">
          <NavItem active={activeSection === 'about-me'}>
            <a href="#about-me">About me</a>
          </NavItem>
          <NavItem active={activeSection === 'skills'}>
            <a href="#skills">Skills</a>
          </NavItem>
          <NavItem active={activeSection === 'projects'}>
            <a href="#projects">Projects</a>
          </NavItem>
          <NavItem active={activeSection === 'contact'}>
            <a href="#contact">Contact</a>
          </NavItem>
        </ul>
      </nav>
    )
  }
)

type NavItemProps = {
  active: boolean
  children: React.ReactElement
}
function NavItem({ active, children }: NavItemProps): React.ReactElement {
  return (
    <li
      className={classNames('mr-4 last-of-type:mr-0', {
        'font-bold': active,
      })}
    >
      {children}
    </li>
  )
}

type SectionProps = {
  id: string
  onEnter: (sectionId: string) => void
  onExit: Function
  children?: React.ReactNode
  className?: string
  last?: boolean
}
function Section({ children, className, id, onEnter, onExit, last }: SectionProps) {
  const handleEnter = useCallback(
    function handleEnter() {
      onEnter(id)
    },
    [id, onEnter]
  )

  const handleExit = useCallback(
    function handleExit() {
      onExit(id)
    },
    [id, onExit]
  )
  const targetRef = useIntersectionObserver<HTMLDivElement>({
    onEnter: handleEnter,
    onExit: handleExit,
    margin: !last
      ? `-${NAV_BAR_PADDING_PX + INTERSECTION_OBSERVER_OFFSET}px`
      : `${INTERSECTION_OBSERVER_OFFSET}px`,
  })

  return (
    <div
      className={classNames('', className, {
        'h-0 overflow-hidden': last,
      })}
      ref={targetRef}
      aria-hidden={last}
    >
      {/* anchor tag use NAV_BAR_PADDING_PX */}
      <a id={id} className={`relative`} aria-hidden></a>
      <div className="">{children}</div>
    </div>
  )
}

type SectionVisibility = {
  'about-me': boolean
  'skills': boolean
  'projects': boolean
  'contact': boolean
  'end': boolean
}

function computeActiveSection(sectionVisibilities: SectionVisibility): keyof SectionVisibility {
  if (sectionVisibilities.end) {
    return 'contact'
  }
  const SECTION_ORDER: Array<keyof SectionVisibility> = ['about-me', 'skills', 'projects', 'contact', 'end']

  const defaultSectionToAvoidTypeError = SECTION_ORDER[0]
  const activeSection =
    SECTION_ORDER.find((sectionId) => {
      return sectionVisibilities[sectionId]
    }) || defaultSectionToAvoidTypeError

  return activeSection
}

type NavBarBackgroundProps = {
  className?: string
}

function NavBarBackground({ className }: NavBarBackgroundProps) {
  return (
    <div
      className={classNames('sticky top-0', className)}
      style={{
        height: NAV_BAR_PADDING_PX,
      }}
    />
  )
}
