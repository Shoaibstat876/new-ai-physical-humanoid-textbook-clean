import type { ReactNode, ReactElement } from "react";
import type React from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

/**
 * HomepageFeatures
 *
 * Purely presentational component for the landing page hero features.
 * This does NOT implement any core Spec-Kit feature logic (no RAG, no chat, no personalization).
 *
 * It is safe to treat this as "marketing/overview UI" and keep it outside
 * of the spec/plan/tasks workflow. If we ever add real behavior here
 * (e.g., navigation, feature toggles), that change must go through Spec-Kit.
 */
const featureList: FeatureItem[] = [
  {
    title: "AI-Native Robotics Textbook",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Learn <strong>Physical AI</strong> and <strong>Humanoid Robotics</strong> through an
        interactive, AI-native textbook. Each chapter is structured for
        Level-based learning: beginner, intermediate, and advanced.
      </>
    ),
  },
  {
    title: "Built-In AI Teaching Assistant",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Ask questions directly from the textbook, get explanations at your
        level, and translate content to Urdu. The learning experience is
        powered by a real RAG backend, not static FAQs.
      </>
    ),
  },
  {
    title: "Spec-Driven Engineering",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Every feature—from RAG search to personalization—is implemented using
        <code>spec.md</code>, <code>plan.md</code>, and <code>tasks.md</code>.
        No vibe coding: architecture, backend, and UI are all Spec-Kit aligned.
      </>
    ),
  },
];

function FeatureItemCard({ title, Svg, description }: FeatureItem): ReactElement {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" aria-label={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactElement {
  return (
    <section className={styles.features} aria-label="AI Physical Humanoid Robotics Textbook features">
      <div className="container">
        <div className="row">
          {featureList.map((item) => (
            <FeatureItemCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
