import Head from 'next/head'
import Image from 'next/image'
import { NextSeo } from 'next-seo'

export default function Home() {
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
     <div className='text-blue-400'>Main</div>
    </>
  )
}
