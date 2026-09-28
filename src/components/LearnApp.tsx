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
import { sweExample, tbV1Example, tbV2Example, type ExampleBlock, type Snippet } from "@/lib/examples";

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
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Coding agent benchmarks</p>
          <h1 className="text-3xl font-semibold tracking-tight">两份考试，两种交卷方式</h1>
          <p className="text-base leading-7 text-muted">
            SWE-bench 要一份补丁。Terminal-Bench 要一台被改完的机器。分数都带着 scaffold。
          </p>
          <div className="flex rounded-full border border-line bg-background p-1">
            <BenchButton active={bench === "swe"} onClick={() => { setBench("swe"); setStep(0); }}>
              SWE-bench
            </BenchButton>
            <BenchButton active={bench === "tb"} onClick={() => { setBench("tb"); setStep(0); }}>
              Terminal-Bench
            </BenchButton>
          </div>
          <LayerStack />
          <dl className="grid gap-3">
            {glossary.map((item) => (
              <div key={item.term} className="rounded-2xl border border-line bg-background px-4 py-3">
                <dt className="text-sm font-medium">{item.term}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{item.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
        {bench === "swe" ? <SweIntro /> : <TbIntro gen={gen} onGen={(next) => { setGen(next); setStep(0); }} />}
        {bench === "swe" ? <SweFlow /> : <TbFlow gen={gen} />}

        <Walkthrough
          blocks={bench === "swe" ? sweExample : gen === "v1" ? tbV1Example : tbV2Example}
        />

        <section className="rounded-3xl border border-line bg-card p-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold">谁能看见什么</h2>
              <p className="mt-1 text-sm leading-6 text-muted">切换阶段，每一行只显示这一侧。</p>
            </div>
            <div className="flex rounded-full border border-line bg-background p-1 text-sm">
              <BenchButton active={phase === "solve"} onClick={() => setPhase("solve")}>解题时</BenchButton>
              <BenchButton active={phase === "grade"} onClick={() => setPhase("grade")}>评测时</BenchButton>
            </div>
          </div>
          <FieldList fields={fields} phase={phase} />
        </section>

        <HarnessFlow harness={harness} step={step} onStep={setStep} />

        {bench === "swe" ? (
          <>
            <Tools />
            <Timeline />
            <section className="rounded-3xl border border-line bg-card p-4">
              <h2 className="text-xl font-semibold">切片</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
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
        ) : null}

        <section className="rounded-3xl border border-line bg-card p-4">
          <h2 className="text-xl font-semibold">并排看</h2>
          <ul className="mt-4 space-y-3">
            {compareRows.map((row) => (
              <li key={row.dim} className="rounded-2xl border border-line bg-background p-3">
                <p className="text-sm font-medium">{row.dim}</p>
                <p className="mt-2 text-sm leading-6">
                  <span className="text-muted">SWE-bench · </span>
                  {row.swe}
                </p>
                <p className="mt-1 text-sm leading-6">
                  <span className="text-muted">Terminal-Bench · </span>
                  {row.tb}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function LayerStack() {
  const layers = [
    { name: "模型", note: "读题，决定下一步" },
    { name: "Agent scaffold", note: "循环、工具、何时停" },
    { name: "评测 harness", note: "隐藏测试和打分" },
  ];
  return (
    <div className="rounded-2xl border border-line bg-background p-3">
      <p className="px-1 text-xs font-medium text-muted">从上往下交卷：模型做事，harness 判分</p>
      <ol className="mt-2">
        {layers.map((layer, index) => (
          <li key={layer.name}>
            <div className={`rounded-xl px-3 py-2 ${index === 2 ? "bg-accent text-white" : "bg-card"}`}>
              <p className="text-sm font-medium">{layer.name}</p>
              <p className={`text-xs leading-5 ${index === 2 ? "text-white/80" : "text-muted"}`}>{layer.note}</p>
            </div>
            {index < layers.length - 1 ? <DownArrow /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SweFlow() {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">流程</h2>
      <p className="mt-1 text-sm leading-6 text-muted">教学例 acme__ports-17 走的就是这条路。金补丁只是人类的一种写法。</p>
      <ol className="mt-4">
        <li>
          <FlowCard kicker="1 · 造题">
            <p className="font-medium">已合并的 PR 拆成两份 diff</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Split label="金补丁" text="改行为。解题时藏住。" />
              <Split label="test_patch" text="新测试。交卷后才注入。" />
            </div>
          </FlowCard>
          <DownArrow label="各跑一遍" />
        </li>
        <li>
          <FlowCard kicker="2 · 贴名单">
            <p className="font-medium">同一套测试，两种仓库状态</p>
            <div className="mt-3 space-y-2 text-sm">
              <LogLine state="只有 test_patch" result="test_port_zero 失败" />
              <LogLine state="再加上金补丁" result="test_port_zero 通过" />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Split label="FAIL_TO_PASS" text="失败变成通过。问题修好了没有。" />
              <Split label="PASS_TO_PASS" text="两次都通过。旧行为还在不在。" />
            </div>
          </FlowCard>
          <DownArrow label="模型看不到 diff 和名单" />
        </li>
        <li>
          <FlowCard kicker="3 · 解题">
            <p className="font-medium">只拿到 issue 和 base_commit 上的代码</p>
            <p className="mt-2 text-sm leading-6 text-muted">scaffold 自己循环。结束时抽出 unified diff，写成 JSONL 的一行。</p>
          </FlowCard>
          <DownArrow label="解题现场丢掉" />
        </li>
        <li>
          <FlowCard kicker="4 · 打分">
            <p className="font-medium">另起一只干净容器，仍从 base_commit 开始</p>
            <ol className="mt-3 space-y-2">
              <MiniStep n="a" text="git apply 模型补丁" />
              <MiniStep n="b" text="打不上就停。resolved 为 false，不再冒充测试失败。" />
              <MiniStep n="c" text="打上之后才注入 test_patch 并跑测试" />
            </ol>
          </FlowCard>
          <DownArrow />
        </li>
        <li>
          <div className="rounded-2xl border border-ok/30 bg-ok/10 px-4 py-3">
            <p className="text-sm font-medium text-ok">resolved</p>
            <p className="mt-1 text-sm leading-6">FAIL_TO_PASS 全部通过，并且 PASS_TO_PASS 全部仍通过。diff 文本不必和金补丁相同。</p>
          </div>
        </li>
      </ol>
    </section>
  );
}

function TbFlow({ gen }: { gen: Gen }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">流程</h2>
      <p className="mt-1 text-sm leading-6 text-muted">教学例 summarize：把脚本改成打印 notes.txt 的行数。当前代际用深色框标出。</p>
      <div className="mt-4 rounded-2xl border-2 border-foreground px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted">工作容器 · agent 改这台机器</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          <li>看得见：指令、坏掉的 summarize.sh、notes.txt</li>
          <li>看得见：自己每条命令的输出</li>
        </ul>
      </div>
      <div className="mt-2 rounded-2xl border border-dashed border-no/50 px-4 py-3 text-sm leading-6 text-no">
        停之前不在机器里：tests/、参考解、奖励该怎么写
      </div>
      <DownArrow label="自己停，或时间用完" />
      <div className="grid gap-2">
        <PathCard active={gen === "v1"} title="原版" text="框架放入 run-tests.sh，用仓库里的 pytest 解析器读输出，得到通过或失败。" />
        <PathCard active={gen === "v2"} title="第 2 代" text="tests/test.sh 自己把 0 或 1 写进 reward.txt。验证器可以换到另一只容器，只带走声明留下的文件。" />
      </div>
    </section>
  );
}

function HarnessFlow({
  harness,
  step,
  onStep,
}: {
  harness: Step[];
  step: number;
  onStep: (index: number) => void;
}) {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">评测步骤</h2>
      <p className="mt-1 text-sm leading-6 text-muted">点开一步，看这一拍具体做什么。</p>
      <ol className="mt-4">
        {harness.map((item, index) => {
          const open = step === index;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => onStep(index)}
                className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                  open ? "bg-accent text-white" : "border border-line bg-background"
                }`}
              >
                <span className="mr-2 font-mono text-xs opacity-70">{index + 1}</span>
                {item.title}
              </button>
              {open ? (
                <div className="mt-2 rounded-2xl border border-line bg-background p-3">
                  <p className="text-sm leading-7">{item.body}</p>
                  {item.code ? (
                    <div className="mt-3">
                      <CodeBlock
                        snippet={{
                          label: item.codeLabel ?? "片段",
                          lang: "text",
                          code: item.code,
                          caption: "",
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {index < harness.length - 1 ? <DownArrow /> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DownArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1 text-accent" aria-hidden>
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
        <path d="M8 0v12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10.5 8 16l5-5.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label ? <span className="text-[11px] leading-4 text-muted">{label}</span> : null}
    </div>
  );
}

function FlowCard({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-background px-3 py-3">
      <p className="font-mono text-[11px] text-accent">{kicker}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}

function Split({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2">
      <p className="font-mono text-[11px] font-medium">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
    </div>
  );
}

function LogLine({ state, result }: { state: string; result: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card px-3 py-2">
      <span className="text-xs text-muted">{state}</span>
      <span className="font-mono text-xs">{result}</span>
    </div>
  );
}

function MiniStep({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-2 text-sm leading-6">
      <span className="font-mono text-xs text-accent">{n}</span>
      <span>{text}</span>
    </li>
  );
}

function PathCard({ active, title, text }: { active: boolean; title: string; text: string }) {
  return (
    <div className={`rounded-2xl px-3 py-3 text-sm leading-6 ${active ? "bg-accent text-white" : "border border-line bg-background text-muted"}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1">{text}</p>
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
      className={`flex-1 rounded-full px-4 py-2 text-sm ${active ? "bg-foreground text-card" : "text-muted"}`}
    >
      {children}
    </button>
  );
}

function SweIntro() {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">SWE-bench 在问什么</h2>
      <p className="mt-3 leading-7">
        给定真实仓库在 <code className="font-mono text-sm">base_commit</code> 的样子，以及对应的 GitHub issue，交出一份 unified diff。评测把这份补丁打进干净容器，再注入当时 PR 新增的测试。
      </p>
      <p className="mt-3 leading-7 text-muted">
        下面的图用缩小的 <code className="font-mono text-sm">acme__ports-17</code> 串起造题、交卷和打分。代码块在图的后面。
      </p>
    </section>
  );
}

function TbIntro({ gen, onGen }: { gen: Gen; onGen: (gen: Gen) => void }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">Terminal-Bench 在问什么</h2>
      <p className="mt-2 leading-7 text-muted">
        给一台准备好的机器和一段指令，让 agent 把机器做成指令描述的状态。同一道教学例 summarize 按代际换成两套目录。
      </p>
      <div className="mt-4 flex rounded-full border border-line bg-background p-1">
        <BenchButton active={gen === "v1"} onClick={() => onGen("v1")}>原版</BenchButton>
        <BenchButton active={gen === "v2"} onClick={() => onGen("v2")}>第 2 代</BenchButton>
      </div>
      <p className="mt-4 leading-7">
        {gen === "v1"
          ? "原版把指令嵌在 task.yaml 里。结束后跑 run-tests.sh，由评测仓库里的解析器读 pytest 输出。"
          : "第 2 代使用 Harbor。instruction.md 单独成文，tests/test.sh 自己把奖励写到 reward.txt。两代通过率不要写在一起。"}
      </p>
    </section>
  );
}

function FieldList({ fields, phase }: { fields: Field[]; phase: Phase }) {
  return (
    <ul className="mt-4">
      {fields.map((field) => {
        const cell = phase === "solve" ? field.solve : field.grade;
        const hidden = cell.includes("不可见") || cell === "不用" || cell.startsWith("不参与");
        return (
          <li key={field.name} className="border-t border-line py-3">
            <p className="font-mono text-xs">{field.name}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{field.what}</p>
            <p className={`mt-1 text-sm leading-6 ${hidden ? "text-no" : "text-ok"}`}>{cell}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Tools() {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">工具不是 benchmark 发的</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        SWE-bench 只收 unified diff。看文件、搜索、编辑、跑 bash，都是 scaffold 决定的。可以跑起点上已有的测试，那不等于看见了交卷后才注入的 test_patch。
      </p>
      <ul className="mt-4 space-y-3">
        {sweTools.map((tool) => (
          <li key={tool.name} className="rounded-2xl border border-line bg-background p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="shrink-0 font-mono text-[11px] text-muted">{tool.loop}</p>
            </div>
            <p className="mt-2 text-sm leading-6">{tool.can}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{tool.use}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Timeline() {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="text-xl font-semibold">三段时间</h2>
      <ol className="mt-4">
        {sweTimeline.map((item, index) => (
          <li key={item.phase}>
            <div className="rounded-2xl border border-line bg-background p-3">
              <h3 className="text-base font-semibold">{item.phase}</h3>
              <ol className="mt-2 space-y-2 text-sm leading-6">
                {item.points.map((point, pointIndex) => (
                  <li key={point}>
                    <span className="mr-2 font-mono text-xs text-accent">{pointIndex + 1}</span>
                    {point}
                  </li>
                ))}
              </ol>
            </div>
            {index < sweTimeline.length - 1 ? <DownArrow /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Walkthrough({ blocks }: { blocks: ExampleBlock[] }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">对照代码</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          字段名和文件布局对齐公开格式。仓库、脚本和超时都是教学例，拿去和官方榜对数字会对不上。
        </p>
      </div>
      {blocks.map((block, index) => (
        <ExampleCard key={block.heading} block={block} index={index} />
      ))}
    </section>
  );
}

function ExampleCard({ block, index }: { block: ExampleBlock; index: number }) {
  return (
    <article className="rounded-3xl border border-line bg-card p-4">
      <p className="font-mono text-xs text-accent">{index + 1}</p>
      <h3 className="mt-1 text-lg font-semibold">{block.heading}</h3>
      <p className="mt-3 text-sm leading-7">{block.prose}</p>
      {block.snippets.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {block.snippets.map((snippet) => (
            <CodeBlock key={snippet.label} snippet={snippet} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CodeBlock({ snippet }: { snippet: Snippet }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-background">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 text-xs">
        <span className="font-medium">{snippet.label}</span>
        <span className="font-mono text-muted">{snippet.lang}</span>
      </figcaption>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-5 whitespace-pre-wrap break-words">
        <code>{snippet.code}</code>
      </pre>
      {snippet.caption ? (
        <figcaption className="border-t border-line px-3 py-2 text-sm leading-6 text-muted">
          {snippet.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
