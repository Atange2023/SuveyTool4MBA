import type { Hypothesis } from '../types';
import type { ModelConfig } from '../lib/pls-sem/types';

export const EXAMPLE_PROJECT = {
  title: 'OpenClaw使用情况与AI Agent数字员工态度调研',
  description: '本研究旨在探讨OpenClaw平台的用户体验、感知有用性、感知易用性如何影响用户对AI Agent数字员工的采纳态度和使用意愿。基于技术接受模型(TAM)框架，结合创新扩散理论，构建结构方程模型进行实证分析。',
  research_question: '用户对OpenClaw平台的使用体验如何影响其对AI Agent数字员工的采纳态度和持续使用意愿？',
  hypotheses: [
    { id: 'H1', label: 'H1', from: '感知易用性', to: '感知有用性', description: '感知易用性正向影响感知有用性' },
    { id: 'H2', label: 'H2', from: '感知易用性', to: '使用态度', description: '感知易用性正向影响使用态度' },
    { id: 'H3', label: 'H3', from: '感知有用性', to: '使用态度', description: '感知有用性正向影响使用态度' },
    { id: 'H4', label: 'H4', from: '感知有用性', to: '使用意愿', description: '感知有用性正向影响使用意愿' },
    { id: 'H5', label: 'H5', from: '使用态度', to: '使用意愿', description: '使用态度正向影响使用意愿' },
    { id: 'H6', label: 'H6', from: '信任感', to: '使用态度', description: '对AI Agent的信任感正向影响使用态度' },
    { id: 'H7', label: 'H7', from: '信任感', to: '使用意愿', description: '对AI Agent的信任感正向影响使用意愿' },
  ] as Hypothesis[],
};

export const EXAMPLE_CONSTRUCTS = [
  { name: '感知易用性', description: '用户感知OpenClaw平台和AI Agent的易用程度', type: 'reflective' as const },
  { name: '感知有用性', description: '用户感知AI Agent数字员工对工作效率的提升程度', type: 'reflective' as const },
  { name: '信任感', description: '用户对AI Agent数字员工的信任程度', type: 'reflective' as const },
  { name: '使用态度', description: '用户对采用AI Agent数字员工的总体态度', type: 'reflective' as const },
  { name: '使用意愿', description: '用户未来继续使用AI Agent数字员工的意愿', type: 'reflective' as const },
];

export const EXAMPLE_INDICATORS = [
  { code: 'PEOU1', question_text: '我觉得学习使用OpenClaw平台很容易', construct: '感知易用性', scale_points: 7 },
  { code: 'PEOU2', question_text: '我能很快掌握OpenClaw的AI Agent功能', construct: '感知易用性', scale_points: 7 },
  { code: 'PEOU3', question_text: 'OpenClaw的界面设计直观清晰', construct: '感知易用性', scale_points: 7 },
  { code: 'PEOU4', question_text: '与AI Agent的交互过程流畅自然', construct: '感知易用性', scale_points: 7 },
  { code: 'PU1', question_text: 'AI Agent数字员工能有效提高我的工作效率', construct: '感知有用性', scale_points: 7 },
  { code: 'PU2', question_text: 'AI Agent能帮助我完成以前难以独立完成的任务', construct: '感知有用性', scale_points: 7 },
  { code: 'PU3', question_text: '使用AI Agent数字员工让我的工作质量有所提升', construct: '感知有用性', scale_points: 7 },
  { code: 'PU4', question_text: 'AI Agent在我的专业领域具有实际应用价值', construct: '感知有用性', scale_points: 7 },
  { code: 'TR1', question_text: '我相信AI Agent能够可靠地执行分配的任务', construct: '信任感', scale_points: 7 },
  { code: 'TR2', question_text: '我信任AI Agent处理数据时的安全性', construct: '信任感', scale_points: 7 },
  { code: 'TR3', question_text: '我对AI Agent的决策结果有信心', construct: '信任感', scale_points: 7 },
  { code: 'ATT1', question_text: '总体而言，我对使用AI Agent数字员工持积极态度', construct: '使用态度', scale_points: 7 },
  { code: 'ATT2', question_text: '使用AI Agent是一个明智的选择', construct: '使用态度', scale_points: 7 },
  { code: 'ATT3', question_text: '我喜欢与AI Agent协作完成工作', construct: '使用态度', scale_points: 7 },
  { code: 'INT1', question_text: '我计划在未来继续使用AI Agent数字员工', construct: '使用意愿', scale_points: 7 },
  { code: 'INT2', question_text: '我会向同事或朋友推荐使用AI Agent', construct: '使用意愿', scale_points: 7 },
  { code: 'INT3', question_text: '如果有机会，我愿意尝试更多的AI Agent功能', construct: '使用意愿', scale_points: 7 },
];

export function getExampleModelConfig(): ModelConfig {
  return {
    constructs: [
      { name: '感知易用性', type: 'reflective', indicatorIndices: [0, 1, 2, 3] },
      { name: '感知有用性', type: 'reflective', indicatorIndices: [4, 5, 6, 7] },
      { name: '信任感', type: 'reflective', indicatorIndices: [8, 9, 10] },
      { name: '使用态度', type: 'reflective', indicatorIndices: [11, 12, 13] },
      { name: '使用意愿', type: 'reflective', indicatorIndices: [14, 15, 16] },
    ],
    paths: [
      { from: '感知易用性', to: '感知有用性' },
      { from: '感知易用性', to: '使用态度' },
      { from: '感知有用性', to: '使用态度' },
      { from: '感知有用性', to: '使用意愿' },
      { from: '使用态度', to: '使用意愿' },
      { from: '信任感', to: '使用态度' },
      { from: '信任感', to: '使用意愿' },
    ],
  };
}

export function generateExampleData(n = 150): number[][] {
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randNormal = () => {
    const u1 = rand();
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.cos(2 * Math.PI * u2);
  };
  const clamp = (v: number) => Math.max(1, Math.min(7, Math.round(v)));

  const data: number[][] = [];
  for (let i = 0; i < n; i++) {
    const peou = 4.5 + randNormal() * 1.0;
    const trust = 4.0 + randNormal() * 1.1;
    const pu = 0.55 * peou + 2.0 + randNormal() * 0.8;
    const att = 0.3 * peou + 0.35 * pu + 0.25 * trust + 0.5 + randNormal() * 0.7;
    const intent = 0.3 * pu + 0.45 * att + 0.15 * trust + 0.3 + randNormal() * 0.6;

    data.push([
      clamp(peou + randNormal() * 0.5), clamp(peou + randNormal() * 0.4),
      clamp(peou + randNormal() * 0.5), clamp(peou + randNormal() * 0.4),
      clamp(pu + randNormal() * 0.5), clamp(pu + randNormal() * 0.4),
      clamp(pu + randNormal() * 0.5), clamp(pu + randNormal() * 0.4),
      clamp(trust + randNormal() * 0.5), clamp(trust + randNormal() * 0.5),
      clamp(trust + randNormal() * 0.4),
      clamp(att + randNormal() * 0.4), clamp(att + randNormal() * 0.4),
      clamp(att + randNormal() * 0.4),
      clamp(intent + randNormal() * 0.4), clamp(intent + randNormal() * 0.4),
      clamp(intent + randNormal() * 0.4),
    ]);
  }
  return data;
}
