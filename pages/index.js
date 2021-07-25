import { NextSeo } from 'next-seo'
import classNames from 'classnames'
import { forwardRef, useEffect, useRef, useState } from 'react'

export default function Home() {
  const [isFixedNavBarVisible, setIsFixedNavBarVisible] = useState(true)
  const fixedNavBarRef = useIntersectionObserver({
    onExit() {
      setIsFixedNavBarVisible(false)
    },
    onEnter() {
      setIsFixedNavBarVisible(true)
    },
    threshold: 1,
  })
  const [sectionVisibilities, setSectionVisibilities] = useState({
    'about-me': false,
    skills: false,
    projects: false,
    contact: false,
    end: false,
  })

  const activeSection = computeActiveSection(sectionVisibilities)

  /**
   * @param {string} sectionId
   */
  function handleSectionEnter(sectionId) {
    setSectionVisibilities((sectionVisibilities) => {
      return {
        ...sectionVisibilities,
        [sectionId]: true,
      }
    })
  }

  /**
   * @param {string} sectionId
   */
  function handleSectionExit(sectionId) {
    setSectionVisibilities((sectionVisibilities) => {
      return {
        ...sectionVisibilities,
        [sectionId]: false,
      }
    })
  }
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
      <NavBar activeSection={activeSection} hidden={!isFixedNavBarVisible} isSticky />
      <NavBar ref={fixedNavBarRef} activeSection={activeSection} />
      <div className="">
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="about-me"
          className="bg-red-300"
        >
          About me
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="skills"
          className="bg-blue-400"
        >
          Skills
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="projects"
          className="bg-green-400"
        >
          Projects
        </Section>
        <Section
          onEnter={handleSectionEnter}
          onExit={handleSectionExit}
          id="contact"
          className="bg-purple-400"
        >
          Contact
        </Section>
        <Section onEnter={handleSectionEnter} onExit={handleSectionExit} id="end" last></Section>
      </div>
    </>
  )
}

const NavBar = forwardRef(
  /**
   *
   * @param {object} props
   * @param {keyof SectionVisibility} props.activeSection
   * @param {boolean} [props.isSticky]
   * @param {boolean} [props.hidden]
   * @param {string} [props.className]
   * @param {*} ref
   * @returns
   */
  function NavBar({ activeSection, className, hidden, isSticky }, ref) {
    return (
      <nav
        ref={ref}
        aria-hidden={hidden}
        className={classNames(
          'w-full',
          className,
          isSticky && {
            fixed: !hidden,
            hidden: hidden,
          }
        )}
      >
        <ul className="bg-white flex flex-row list-none">
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

/**
 *
 * @param {object} props
 * @param {boolean} props.active
 * @param {import('react').ReactElement} props.children
 * @returns {import('react').ReactElement}
 */
function NavItem({ active, children }) {
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
/**
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} props.id
 * @param {(sectionId: string) => void} props.onEnter
 * @param {Function} props.onExit
 * @param {string} [props.className]
 * @param {boolean} [props.last]
 */
function Section({ children, className, id, onEnter, onExit, last }) {
  function handleEnter() {
    onEnter(id)
  }

  function handleExit() {
    onExit(id)
  }
  const targetRef = useIntersectionObserver({
    onEnter: handleEnter,
    onExit: handleExit,
    margin: !last ? '-32px' : '0px',
  })
  return (
    <div
      id={id}
      className={classNames('h-[80vh]', className, { 'h-0 overflow-hidden': last })}
      ref={targetRef}
      aria-hidden={last}
    >
      <div className="grid place-items-center h-full">{children}</div>
    </div>
  )
}

/**
 *
 * @template T
 * @param {UseIntersectionObserverProps} props
 * @returns {import('react').MutableRefObject<T & HTMLElement | null>}
 */
function useIntersectionObserver({ onExit, onEnter, margin, threshold = 0 }) {
  const targetRef = useRef(/** @type{T & HTMLElement | null} */ (null))

  useEffect(() => {
    if (targetRef.current) {
      const targetRefValue = targetRef.current
      /**
       * @type {IntersectionObserverCallback}
       */
      function callback(entries) {
        entries.forEach((entry) => {
          if (entry.intersectionRatio === threshold) {
            onExit()
          } else {
            onEnter()
          }
        })
      }

      const config = {
        rootMargin: margin,
        threshold,
      }

      const observer = new IntersectionObserver(callback, config)
      observer.observe(targetRefValue)

      return () => {
        observer.unobserve(targetRefValue)
      }
    }
  }, [])

  return targetRef
}

/**
 * @typedef {{ 'about-me': boolean; skills: boolean; projects: boolean; contact: boolean; end: boolean; }} SectionVisibility
 *
 * @param {SectionVisibility} sectionVisibilities
 * @returns {keyof SectionVisibility}
 */
function computeActiveSection(sectionVisibilities) {
  if (sectionVisibilities.end) {
    return 'contact'
  }
  /**
   * @type {Array<keyof SectionVisibility>}
   */
  const SECTION_ORDER = ['about-me', 'skills', 'projects', 'contact', 'end']

  const defaultSectionToAvoidTypeError = SECTION_ORDER[0]
  const activeSection =
    SECTION_ORDER.find((sectionId) => {
      return sectionVisibilities[sectionId]
    }) || defaultSectionToAvoidTypeError

  return activeSection
}
