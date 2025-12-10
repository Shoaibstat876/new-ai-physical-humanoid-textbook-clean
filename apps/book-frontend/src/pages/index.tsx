import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* Main headline */}
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          AI Physical Humanoid Robotics Textbook
        </Heading>

        {/* Premium, formal subtitle */}
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          A spec-driven, AI-native textbook for learning Physical AI, simulation,
          and humanoid robotics. Each chapter is connected to RAG chat, level-based
          explanations, and Urdu translation to support real classrooms and labs.
        </p>

        {/* Primary CTA row */}
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/foundations/how-to-use-this-book"
          >
            Start the textbook
          </Link>

          <Link
            className="button button--outline button--lg"
            to="/docs/foundations/why-physical-ai-matters"
          >
            Explore Physical AI
          </Link>
        </div>

        {/* Small meta strip under buttons */}
        <div className={styles.metaStrip}>
          <span>Level-based learning (beginner → advanced)</span>
          <span>Urdu + English explanations</span>
          <span>RAG-powered chapter Q&amp;A</span>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="AI-native Physical AI & Humanoid Robotics textbook with RAG chat, Urdu translation, and level-based personalization for learners with different backgrounds."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
