import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  textbook: [
    // ======================
    // Foundations
    // ======================
    {
      type: 'category',
      label: 'Foundations',
      collapsed: false,
      items: [
        'foundations/how-to-use-this-book',                 // Start here
        'foundations/why-physical-ai-matters',              // Motivation
        'foundations/why-humanoids',                        // Why humanoid form
        'foundations/digital-to-embodied-intelligence',     // Theory
        'foundations/data-from-the-real-world',             // Real data
        'foundations/robot-sensors-and-perception',         // Sensors
        'foundations/robot-control-systems',                // Control
        'foundations/actuation-and-locomotion',             // Locomotion
        'foundations/humanoid-design-kinematics',           // Kinematics
      ],
    },

    // ======================
    // Humanoid Robotics
    // ======================
    {
      type: 'category',
      label: 'Humanoid Robotics',
      collapsed: false,
      items: [
        // There is no `humanoids/humanoid-overview` doc id,
        // so we start directly with the engineering overview.
        'humanoids/humanoid-engineering-overview',
        'humanoids/humanoid-locomotion',
        'humanoids/humanoid-manipulation',
        'humanoids/humanoid-learning',
        'humanoids/humanoid-software-architecture',
        'humanoids/humanoid-safety',
      ],
    },

    // ======================
    // ROS2
    // ======================
    {
      type: 'category',
      label: 'ROS2',
      collapsed: false,
      items: [
        'ros2/ros2-introduction',
        'ros2/ros2-nodes-topics',
        'ros2/ros2-parameters',
        'ros2/ros2-services-actions',
        'ros2/ros2-actions',
        // Correct doc id for launch files:
        'ros2/ros2-launch-files',
      ],
    },

    // ======================
    // Isaac Simulation
    // ======================
    {
      type: 'category',
      label: 'Isaac Simulation',
      collapsed: false,
      items: [
        'isaac/isaac-simulation-introduction',
        'isaac/isaac-simulation-workspace',
        'isaac/physics-and-materials',
        'isaac/robot-asset-import',
        'isaac/isaac-rl-simulation',
      ],
    },

    // ======================
    // Simulation
    // ======================
    {
      type: 'category',
      label: 'Simulation',
      collapsed: false,
      items: [
        'simulation/training-in-simulation',
      ],
    },

    // ======================
    // Conversational AI
    // ======================
    {
      type: 'category',
      label: 'Conversational AI',
      collapsed: false,
      items: [
        'conversational/conversational-ai-introduction',
        'conversational/conversational-ai-natural-language-understanding',
        'conversational/conversational-ai-dialogue-management',
        'conversational/conversational-dialogue-management',
        'conversational/conversational-multimodal-ai',
        'conversational/conversational-safety',
      ],
    },

    // ======================
    // Capstone
    // ======================
    {
      type: 'category',
      label: 'Capstone Project',
      collapsed: false,
      items: [
        'capstone/capstone-overview',
        'capstone/capstone-problem-definition',
        'capstone/capstone-project-overview',
        'capstone/capstone-system-architecture',
        'capstone/capstone-testing-validation',
      ],
    },
  ],
};

export default sidebars;
