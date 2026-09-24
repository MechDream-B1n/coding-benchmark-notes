"use client";

import { useState, type ReactNode } from "react";
import {
  compareRows,
  glossary,
  sweBranches,
  sweFields,
  sweHarness,
  sweTimeline,
  sweTools,
  tbV1Fields,
  tbV1Harness,
  tbV2Fields,
  tbV2Harness,
  type Field,
  type Phase,
  type Step,
} from "@/lib/content";

type Bench = "swe" | "tb";
type Gen = "v1" | "v2";

export function LearnApp() {
  const [bench, setBench] = useState<Bench>("swe");
  const [gen, setGen] = useState<Gen>("v1");
  const [phase, setPhase] = useState<Phase>("solve");
  const [branch, setBranch] = useState(sweBranches[0].name);
  const [step, setStep] = useState(0);

  const fields = bench === "swe" ? sweFields : gen === "v1" ? tbV1Fields : tbV2Fields;
  const harness = bench === "swe" ? sweHarness : gen === "v1" ? tbV1Harness : tbV2Harness;
  const activeBranch = sweBranches.find((item) => item.name === branch) ?? sweBranches[0];

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:px-8">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Coding agent benchmarks</p>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">两份考试，两种交卷方式</h1>
              <p className="mt-3 text-base leading-7 text-muted">
                SWE-bench 要一份补丁。Terminal-Bench 要一台被改完的机器。分数都带着 scaffold，不能只看模型名。
              </p>
            </div>
            <div className="flex rounded-full border border-line bg-background p-1">
              <BenchButton active={bench === "swe"} onClick={() => { setBench("swe"); setStep(0); }}>
                SWE-bench
              </BenchButton>
              <BenchButton active={bench === "tb"} onClick={() => { setBench("tb"); setStep(0); }}>
                Terminal-Bench
              </BenchButton>
            </div>
          </div>
          <dl className="grid gap-3 md:grid-cols-2">
            {glossary.map((item) => (
              <div key={item.term} className="rounded-2xl border border-line bg-background px-4 py-3">
                <dt className="text-sm font-medium">{item.term}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{item.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:px-8">
        {bench === "swe" ? <SweIntro /> : <TbIntro gen={gen} onGen={(next) => { setGen(next); setStep(0); }} />}

        <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">谁能看见什么</h2>
              <p className="mt-1 text-sm text-muted">切换阶段，表格只显示这一侧能用到的信息。</p>
            </div>
            <div className="flex rounded-full border border-line bg-background p-1 text-sm">
              <BenchButton active={phase === "solve"} onClick={() => setPhase("solve")}>解题时</BenchButton>
              <BenchButton active={phase === "grade"} onClick={() => setPhase("grade")}>评测时</BenchButton>
            </div>
          </div>
          <FieldTable fields={fields} phase={phase} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="rounded-3xl border border-line bg-card p-4">
            <h2 className="px-2 text-sm font-medium text-muted">评测步骤</h2>
            <ol className="mt-3 space-y-1">
              {harness.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                      step === index ? "bg-accent text-white" : "hover:bg-background"
                    }`}
                  >
                    <span className="mr-2 font-mono text-xs opacity-70">{index + 1}</span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <HarnessDetail step={harness[step]} index={step} total={harness.length} />
        </section>

        {bench === "swe" ? (
          <>
            <Tools />
            <Timeline />
            <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
              <h2 className="text-xl font-semibold">切片</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                都是交补丁、看测试过渡。差别在题从哪来，以及榜单有没有把 scaffold 写死。带约数的规模以官方页面为准。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {sweBranches.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setBranch(item.name)}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      branch === item.name ? "bg-foreground text-card" : "border border-line bg-background"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-base leading-7">{activeBranch.text}</p>
            </section>
          </>
        ) : (
          <TbExtra gen={gen} />
        )}

        <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
          <h2 className="text-xl font-semibold">并排看</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-medium">维度</th>
                  <th className="py-2 pr-4 font-medium">SWE-bench</th>
                  <th className="py-2 font-medium">Terminal-Bench</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.dim} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.dim}</td>
                    <td className="py-3 pr-4 leading-6">{row.swe}</td>
                    <td className="py-3 leading-6">{row.tb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function BenchButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm ${active ? "bg-foreground text-card" : "text-muted"}`}
    >
      {children}
    </button>
  );
}

function SweIntro() {
  return (
    <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <article className="rounded-3xl border border-line bg-card p-5 md:p-7">
        <h2 className="text-xl font-semibold">SWE-bench 在问什么</h2>
        <p className="mt-3 leading-7">
          给定真实仓库在 <code className="font-mono text-sm">base_commit</code> 的样子，以及对应的 GitHub issue，交出一份补丁，让问题行为被修好，且无关功能的测试仍然通过。
        </p>
        <p className="mt-3 leading-7 text-muted">
          做对不等于复现金补丁。另一份写法只要让规定的测试过渡成立，也算 resolved。解题时只能使用起点代码和 issue 描述。
        </p>
      </article>
      <article className="rounded-3xl bg-accent p-5 text-white md:p-7">
        <h2 className="text-lg font-semibold">怎样算做对</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>FAIL_TO_PASS 里每一个测试都通过。</li>
          <li>PASS_TO_PASS 里每一个测试仍通过。</li>
          <li>两者同时成立，该题 resolved。</li>
          <li>标准答案是测试状态，不是 diff 字符串相等。</li>
        </ul>
      </article>
    </section>
  );
}

function TbIntro({ gen, onGen }: { gen: Gen; onGen: (gen: Gen) => void }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Terminal-Bench 在问什么</h2>
          <p className="mt-2 max-w-3xl leading-7 text-muted">
            给一台准备好的机器和一段指令，让 agent 把机器做成指令描述的状态。没有 GitHub issue，也没有事先存在的失败测试当作完成定义。
          </p>
        </div>
        <div className="flex rounded-full border border-line bg-background p-1">
          <BenchButton active={gen === "v1"} onClick={() => onGen("v1")}>原版</BenchButton>
          <BenchButton active={gen === "v2"} onClick={() => onGen("v2")}>第 2 代</BenchButton>
        </div>
      </div>
      <p className="mt-4 leading-7">
        {gen === "v1"
          ? "原版把指令嵌在 task.yaml 里，结束后跑 run-tests.sh，由评测仓库里的解析器读退出码。"
          : "第 2 代使用 Harbor：instruction.md 单独成文，tests/test.sh 自己把奖励写到 reward.txt，验证器可以和 agent 不在同一个容器。两代通过率不要写在一起。"}
      </p>
    </section>
  );
}

function FieldTable({ fields, phase }: { fields: Field[]; phase: Phase }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-muted">
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-medium">字段</th>
            <th className="py-2 pr-4 font-medium">是什么</th>
            <th className="py-2 font-medium">{phase === "solve" ? "解题时" : "评测时"}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const cell = phase === "solve" ? field.solve : field.grade;
            const hidden = cell.includes("不可见") || cell === "不用" || cell.startsWith("不参与");
            return (
              <tr key={field.name} className="border-b border-line last:border-0">
                <td className="py-3 pr-4 font-mono text-xs">{field.name}</td>
                <td className="py-3 pr-4 leading-6">{field.what}</td>
                <td className={`py-3 leading-6 ${hidden ? "text-no" : "text-ok"}`}>{cell}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HarnessDetail({ step, index, total }: { step: Step; index: number; total: number }) {
  return (
    <article className="rounded-3xl border border-line bg-card p-6 md:p-8">
      <p className="font-mono text-xs text-muted">
        {index + 1} / {total}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{step.title}</h2>
      <p className="mt-4 text-base leading-8">{step.body}</p>
    </article>
  );
}

function Tools() {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
      <h2 className="text-xl font-semibold">工具不是 benchmark 发的</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        SWE-bench 只收 unified diff。看文件、搜索、编辑、跑 bash，都是 scaffold 决定的。可以跑起点上已有的测试，那不等于看见了交卷后才注入的 test_patch。
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">做法</th>
              <th className="py-2 pr-3 font-medium">模型能做什么</th>
              <th className="py-2 pr-3 font-medium">循环</th>
              <th className="py-2 font-medium">用途</th>
            </tr>
          </thead>
          <tbody>
            {sweTools.map((tool) => (
              <tr key={tool.name} className="border-b border-line last:border-0">
                <td className="py-3 pr-3 font-medium">{tool.name}</td>
                <td className="py-3 pr-3 leading-6">{tool.can}</td>
                <td className="py-3 pr-3">{tool.loop}</td>
                <td className="py-3 leading-6 text-muted">{tool.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {sweTimeline.map((item) => (
        <article key={item.phase} className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-lg font-semibold">{item.phase}</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6">
            {item.points.map((point, index) => (
              <li key={point}>
                <span className="mr-2 font-mono text-xs text-accent">{index + 1}</span>
                {point}
              </li>
            ))}
          </ol>
        </article>
      ))}
    </section>
  );
}

function TbExtra({ gen }: { gen: Gen }) {
  const points =
    gen === "v1"
      ? [
          "造题：写 task.yaml、Dockerfile、测试和 solution.sh，确认参考解能通过框架解析器。",
          "解题：agent 改这台机器，直到自己停或超时。看得见命令输出，看不见 run-tests.sh。",
          "打分：跑 run-tests.sh，用仓库内解析器得到二元结果。答案是结束时的环境，不是 git diff。",
        ]
      : [
          "造题：写 instruction.md、environment/、tests/test.sh 和 solve.sh。测试不要放进 agent 镜像。",
          "解题：agent 操作工作容器。中立 scaffold 给 shell，厂商 agent 自带编辑和重试。",
          "打分：导出 task.toml 允许留下的现场，在验证器里跑 test.sh，读奖励文件。",
        ];
  return (
    <section className="rounded-3xl border border-line bg-card p-5 md:p-7">
      <h2 className="text-xl font-semibold">从造题到打分</h2>
      <ol className="mt-4 space-y-3">
        {points.map((point, index) => (
          <li key={point} className="flex gap-3 leading-7">
            <span className="mt-0.5 font-mono text-sm text-accent">{index + 1}</span>
            <span>{point}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
