/**
 * Spec-Kit Trace
 * Feature: docs-site UI (homepage route; presentational shell)
 * Spec: N/A
 * Plan: N/A
 * Tasks: N/A
 * Story: N/A
 * Task(s): N/A
 * Purpose: Render the Docusaurus home page layout, hero header, and feature section.
 * Non-Goals: Implementing feature logic (RAG calls, auth, personalization flows),
 *            stateful product behavior, or backend contracts.
 *
 * NOTE: If this page gains feature behavior beyond static navigation/marketing copy,
 * it MUST be moved under a proper specs/<###-feature>/ workflow.
 */

import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

// Trace: N/A — Presentational hero section
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        {/* Main headline */}
        <Heading as="h1" className={clsx("hero__title", styles.heroTitle)}>
          AI Physical Humanoid Robotics Textbook
        </Heading>

        {/* Premium, formal subtitle */}
        <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
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
            Textbook
          </Link>

          <Link className="button button--outline button--lg" to="/docs/modules">
            Modules
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

// Trace: N/A — Homepage route
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
