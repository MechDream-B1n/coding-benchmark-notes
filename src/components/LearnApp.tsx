"use client";

import { useEffect, useState, type ReactNode } from "react";
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

type Gen = "v1" | "v2";

export function LearnApp() {
  const [gen, setGen] = useState<Gen>("v1");
  const [phase, setPhase] = useState<Phase>("solve");
  const [branch, setBranch] = useState(sweBranches[0].name);
  const [sweStep, setSweStep] = useState(0);
  const [tbStep, setTbStep] = useState(0);

  const tbFields = gen === "v1" ? tbV1Fields : tbV2Fields;
  const tbHarness = gen === "v1" ? tbV1Harness : tbV2Harness;
  const activeBranch = sweBranches.find((item) => item.name === branch) ?? sweBranches[0];

  return (
    <div className="min-h-full">
      <SiteNav />
      <main id="top" className="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6">
        <section className="py-12 sm:py-16">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">学习笔记 · Coding agent benchmarks</p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            两份考试，
            <span className="bg-gradient-to-r from-sky-500 via-emerald-500 to-indigo-500 bg-clip-text text-transparent">两种交卷方式</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            SWE-bench 要一份补丁。Terminal-Bench 要一台被改完的机器。分数都带着 scaffold，不能只看模型名。
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <LayerStack />
            <dl className="grid gap-3">
              {glossary.map((item) => (
                <div key={item.term} className="rounded-xl border bg-card px-4 py-3">
                  <dt className="text-sm font-medium">{item.term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">{item.def}</dd>
                </div>
              ))}
            </dl>
            <Callout>
              <b>阅读顺序：</b>
              先看上面三层，分清谁在做事、谁在判分。然后读 SWE-bench 的流程图和教学例，再读 Terminal-Bench 的两代目录。最后用对照把交卷物和现场对上。
            </Callout>
          </div>
        </section>

        <section id="swe" className="scroll-mt-20 flex flex-col gap-6 border-t py-14 sm:py-20">
          <SectionHeading
            index="01"
            color="#0ea5e9"
            kicker="交一份补丁"
            title="SWE-bench"
            tagline="真实仓库停在 base_commit。模型只看见 issue。评测把补丁打进干净容器，再注入当时 PR 新增的测试。"
          />
          <SweIntro />
          <SweFlow />
          <Walkthrough blocks={sweExample} />
          <Visibility phase={phase} onPhase={setPhase} fields={sweFields} />
          <HarnessFlow harness={sweHarness} step={sweStep} onStep={setSweStep} />
          <Tools />
          <Timeline />
          <section className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
            <h2 className="text-xl font-bold tracking-tight">切片</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              都是交补丁、看测试过渡。差别在题从哪来，以及榜单有没有把 scaffold 写死。带约数的规模以官方页面为准。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sweBranches.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setBranch(item.name)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    branch === item.name ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-base leading-7">{activeBranch.text}</p>
          </section>
        </section>

        <section id="tb" className="scroll-mt-20 flex flex-col gap-6 border-t py-14 sm:py-20">
          <SectionHeading
            index="02"
            color="#10b981"
            kicker="交一台机器"
            title="Terminal-Bench"
            tagline="给一台准备好的机器和一段指令。原版用框架解析 pytest，第 2 代由任务自己写下奖励文件。两代通过率不要写在一起。"
          />
          <TbIntro gen={gen} onGen={(next) => { setGen(next); setTbStep(0); }} />
          <TbFlow gen={gen} />
          <Walkthrough blocks={gen === "v1" ? tbV1Example : tbV2Example} />
          <Visibility phase={phase} onPhase={setPhase} fields={tbFields} />
          <HarnessFlow harness={tbHarness} step={tbStep} onStep={setTbStep} />
        </section>

        <section id="compare" className="scroll-mt-20 border-t py-14 sm:py-20">
          <SectionHeading
            index="03"
            color="#6366f1"
            kicker="放在一起"
            title="对照"
            tagline="同一类「把仓库或机器改到目标状态」的考试，交卷物和打分现场不一样。"
          />
          <ul className="mt-8 space-y-3">
            {compareRows.map((row) => (
              <li key={row.dim} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-sm font-semibold">{row.dim}</p>
                <p className="mt-2 text-sm leading-6">
                  <span className="font-medium text-sky-600">SWE-bench · </span>
                  {row.swe}
                </p>
                <p className="mt-1 text-sm leading-6">
                  <span className="font-medium text-emerald-600">Terminal-Bench · </span>
                  {row.tb}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        教学例不是榜上的真题。规模若与官方页面不一致，以 swebench.com 和 Terminal-Bench 仓库为准。
      </footer>
    </div>
  );
}

const NAV = [
  { id: "swe", label: "SWE-bench", color: "#0ea5e9" },
  { id: "tb", label: "Terminal-Bench", color: "#10b981" },
  { id: "compare", label: "对照", color: "#6366f1" },
];

function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setProgress(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
      let cur: string | null = null;
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = item.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" className="shrink-0 text-sm font-bold tracking-tight">
          两份 Coding Benchmark
        </a>
        <nav className="no-scrollbar -mx-2 flex min-w-0 flex-1 gap-1 overflow-x-auto px-2">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
                active === item.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="size-1.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="h-0.5 bg-foreground transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
    </header>
  );
}

function SectionHeading({
  index,
  color,
  kicker,
  title,
  tagline,
}: {
  index: string;
  color: string;
  kicker: string;
  title: string;
  tagline: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm"
        style={{ background: color }}
      >
        {index}
      </span>
      <div>
        <p className="mb-1 text-xs font-medium" style={{ color }}>{kicker}</p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">{tagline}</p>
      </div>
    </div>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
      <span className="mt-0.5 text-amber-500" aria-hidden>✦</span>
      <div>{children}</div>
    </div>
  );
}

function Visibility({
  phase,
  onPhase,
  fields,
}: {
  phase: Phase;
  onPhase: (phase: Phase) => void;
  fields: Field[];
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">谁能看见什么</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">切换阶段，每一行只显示这一侧。</p>
        </div>
        <div className="inline-flex self-start rounded-full border bg-background p-1 text-sm">
          <BenchButton active={phase === "solve"} onClick={() => onPhase("solve")}>解题时</BenchButton>
          <BenchButton active={phase === "grade"} onClick={() => onPhase("grade")}>评测时</BenchButton>
        </div>
      </div>
      <FieldList fields={fields} phase={phase} />
    </section>
  );
}

function LayerStack() {
  const layers = [
    { name: "模型", note: "读题，决定下一步" },
    { name: "Agent scaffold", note: "循环、工具、何时停" },
    { name: "评测 harness", note: "隐藏测试和打分" },
  ];
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-3">
      <p className="px-1 text-xs font-medium text-muted-foreground">从上往下交卷：模型做事，harness 判分</p>
      <ol className="mt-2 flex flex-col">
        {layers.map((layer, index) => (
          <li key={layer.name}>
            <div className={`rounded-xl px-3 py-3 ${index === 2 ? "bg-foreground text-background" : "bg-card"}`}>
              <p className="text-sm font-medium">{layer.name}</p>
              <p className={`text-xs leading-5 ${index === 2 ? "text-white/80" : "text-muted-foreground"}`}>{layer.note}</p>
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
    <section className="h-full rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">流程</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">教学例 acme__ports-17 走的就是这条路。金补丁只是人类的一种写法。</p>
      <ol className="mt-4">
        <li>
          <FlowCard kicker="1 · 造题">
            <p className="font-medium">已合并的 PR 拆成两份 diff</p>
            <div className="mt-3 grid gap-2 text-sm">
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
            <div className="mt-3 grid gap-2 text-sm">
              <Split label="FAIL_TO_PASS" text="失败变成通过。问题修好了没有。" />
              <Split label="PASS_TO_PASS" text="两次都通过。旧行为还在不在。" />
            </div>
          </FlowCard>
          <DownArrow label="模型看不到 diff 和名单" />
        </li>
        <li>
          <FlowCard kicker="3 · 解题">
            <p className="font-medium">只拿到 issue 和 base_commit 上的代码</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">scaffold 自己循环。结束时抽出 unified diff，写成 JSONL 的一行。</p>
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">resolved</p>
            <p className="mt-1 text-sm leading-6">FAIL_TO_PASS 全部通过，并且 PASS_TO_PASS 全部仍通过。diff 文本不必和金补丁相同。</p>
          </div>
        </li>
      </ol>
    </section>
  );
}

function TbFlow({ gen }: { gen: Gen }) {
  return (
    <section className="h-full rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">流程</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">教学例 summarize：把脚本改成打印 notes.txt 的行数。当前代际用深色框标出。</p>
      <div className="mt-4 rounded-2xl border-2 border-foreground px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">工作容器 · agent 改这台机器</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          <li>看得见：指令、坏掉的 summarize.sh、notes.txt</li>
          <li>看得见：自己每条命令的输出</li>
        </ul>
      </div>
      <div className="mt-2 rounded-2xl border border-dashed border-red-300 px-4 py-3 text-sm leading-6 text-red-600">
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
    <section className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">评测步骤</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">点开一步，看这一拍具体做什么。</p>
      <ol className="mt-4">
        {harness.map((item, index) => {
          const open = step === index;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => onStep(index)}
                className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                  open ? "bg-foreground text-background" : "border border-border bg-background"
                }`}
              >
                <span className="mr-2 font-mono text-xs opacity-70">{index + 1}</span>
                {item.title}
              </button>
              {open ? (
                <div className="mt-2 rounded-2xl border border-border bg-background p-3">
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
    <div className="flex flex-col items-center py-1 text-sky-600" aria-hidden>
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
        <path d="M8 0v12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10.5 8 16l5-5.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label ? <span className="text-[11px] leading-4 text-muted-foreground">{label}</span> : null}
    </div>
  );
}

function FlowCard({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-3 py-3">
      <p className="font-mono text-[11px] text-sky-600">{kicker}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}

function Split({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="font-mono text-[11px] font-medium">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function LogLine({ state, result }: { state: string; result: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card px-3 py-2">
      <span className="text-xs text-muted-foreground">{state}</span>
      <span className="font-mono text-xs">{result}</span>
    </div>
  );
}

function MiniStep({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-2 text-sm leading-6">
      <span className="font-mono text-xs text-sky-600">{n}</span>
      <span>{text}</span>
    </li>
  );
}

function PathCard({ active, title, text }: { active: boolean; title: string; text: string }) {
  return (
    <div className={`rounded-2xl px-3 py-3 text-sm leading-6 ${active ? "bg-foreground text-background" : "border border-border bg-background text-muted-foreground"}`}>
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
      className={`rounded-full px-4 py-2 text-sm ${active ? "bg-foreground text-background" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

function SweIntro() {
  return (
    <section className="h-full rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">SWE-bench 在问什么</h2>
      <p className="mt-3 leading-7">
        给定真实仓库在 <code className="font-mono text-sm">base_commit</code> 的样子，以及对应的 GitHub issue，交出一份 unified diff。评测把这份补丁打进干净容器，再注入当时 PR 新增的测试。
      </p>
      <p className="mt-3 leading-7 text-muted-foreground">
        下面的图用缩小的 <code className="font-mono text-sm">acme__ports-17</code> 串起造题、交卷和打分。代码块在图的后面。
      </p>
    </section>
  );
}

function TbIntro({ gen, onGen }: { gen: Gen; onGen: (gen: Gen) => void }) {
  return (
    <section className="h-full rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">Terminal-Bench 在问什么</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        给一台准备好的机器和一段指令，让 agent 把机器做成指令描述的状态。同一道教学例 summarize 按代际换成两套目录。
      </p>
      <div className="mt-4 inline-flex rounded-full border border-border bg-background p-1">
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
          <li key={field.name} className="border-t border-border py-3">
            <p className="font-mono text-xs">{field.name}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{field.what}</p>
            <p className={`mt-1 text-sm leading-6 ${hidden ? "text-red-600" : "text-emerald-700"}`}>{cell}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Tools() {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">工具不是 benchmark 发的</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        SWE-bench 只收 unified diff。看文件、搜索、编辑、跑 bash，都是 scaffold 决定的。可以跑起点上已有的测试，那不等于看见了交卷后才注入的 test_patch。
      </p>
      <ul className="mt-4 grid gap-3">
        {sweTools.map((tool) => (
          <li key={tool.name} className="rounded-2xl border border-border bg-background p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="shrink-0 font-mono text-[11px] text-muted-foreground">{tool.loop}</p>
            </div>
            <p className="mt-2 text-sm leading-6">{tool.can}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{tool.use}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Timeline() {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
      <h2 className="text-xl font-semibold">三段时间</h2>
      <ol className="mt-4 grid gap-0">
        {sweTimeline.map((item, index) => (
          <li key={item.phase}>
            <div className="h-full rounded-2xl border border-border bg-background p-3">
              <h3 className="text-base font-semibold">{item.phase}</h3>
              <ol className="mt-2 space-y-2 text-sm leading-6">
                {item.points.map((point, pointIndex) => (
                  <li key={point}>
                    <span className="mr-2 font-mono text-xs text-sky-600">{pointIndex + 1}</span>
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
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
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
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-xs text-sky-600">{index + 1}</p>
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
    <figure className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b px-3 py-2 text-xs">
        <span className="font-medium">{snippet.label}</span>
        <span className="font-mono text-muted-foreground">{snippet.lang}</span>
      </figcaption>
      <pre className="overflow-x-auto bg-zinc-950 px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-zinc-100">
        <code>{snippet.code}</code>
      </pre>
      {snippet.caption ? (
        <figcaption className="border-t px-3 py-2 text-sm leading-6 text-muted-foreground">
          {snippet.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
