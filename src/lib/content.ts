export type Phase = "solve" | "grade";

export type Field = {
  name: string;
  what: string;
  solve: string;
  grade: string;
};

export type Step = { title: string; body: string };

export const glossary = [
  {
    term: "评测 harness",
    def: "出题方的环境、隐藏测试和打分程序。SWE-bench 的 swebench.harness 属于这一层。",
  },
  {
    term: "Agent scaffold",
    def: "模型外面的循环和工具。benchmark 不附送工具时，工具属于 scaffold。",
  },
];

export const sweFields: Field[] = [
  { name: "instance_id", what: "通常是 owner__repo-PR号", solve: "可见", grade: "可见" },
  { name: "repo", what: "GitHub 仓库", solve: "可见", grade: "可见" },
  { name: "base_commit", what: "修复 PR 落上去之前的提交", solve: "可见，作为代码起点", grade: "容器从这里开始" },
  { name: "problem_statement", what: "issue 标题加正文。多条 issue 会拼在一起", solve: "可见，这是任务说明", grade: "不参与打分" },
  { name: "hints_text", what: "PR 首次提交之前的评论，里面可能有解法暗示", solve: "数据集里有；论文主实验不用", grade: "不用" },
  { name: "patch", what: "金补丁，PR 中的非测试改动", solve: "不可见", grade: "仅在用 gold 自检时当作待测补丁" },
  { name: "test_patch", what: "PR 中新增或修改的测试", solve: "不可见", grade: "先打进仓库，再跑测试" },
  { name: "FAIL_TO_PASS", what: "打上测试后应失败、修复后应通过的测试名", solve: "不可见", grade: "决定问题有没有被解决" },
  { name: "PASS_TO_PASS", what: "修复前后都应该通过的测试名", solve: "不可见", grade: "决定有没有打坏原有行为" },
  { name: "FAIL_TO_FAIL / PASS_TO_FAIL", what: "其他过渡，用于附加统计", solve: "不可见", grade: "默认可选，不决定 resolved" },
];

export const sweHarness: Step[] = [
  { title: "准备容器", body: "代码停在 base_commit。镜像分三层：基础语言、仓库依赖、这一道题。" },
  { title: "应用模型补丁", body: "把 unified diff 放进容器，尝试 git apply。失败会先恢复干净工作区再换参数。打不上就记为无法应用，不算「测试没过」。" },
  { title: "注入测试并执行", body: "仓库评测脚本再应用 test_patch、跑测试、留下日志。多模态题还要把图片基线放回期望路径。" },
  { title: "解析并判分", body: "FAIL_TO_PASS 全部通过，且 PASS_TO_PASS 全部保持通过，才算 resolved。主指标是 resolved 的题目比例。" },
];

export const sweTools = [
  { name: "Oracle 检索", can: "直接看到金补丁改过的文件，一次写出补丁", loop: "无", use: "上限参照，不是真实 agent" },
  { name: "BM25 检索", can: "用 issue 文本检索若干文件，一次写出补丁", loop: "无", use: "早期非 agent 基线" },
  { name: "SWE-agent ACI", can: "窗口看文件、有界搜索、按行编辑；语法不过则回滚", loop: "多步", use: "说明界面本身会改变分数" },
  { name: "mini-swe-agent", can: "只有 bash。每步是一次独立命令", loop: "多步", use: "Bash Only：同一 scaffold 下比模型" },
  { name: "Agentless", can: "定位文件，生成补丁，再用回归测试挑选", loop: "固定流水线", use: "不一定要自由循环" },
  { name: "OpenHands", can: "bash、Python、文件编辑", loop: "多步", use: "更接近通用编程 agent" },
  { name: "厂商 agent", can: "各自的编辑、搜索、终端，有的还有浏览器", loop: "多步，预算不同", use: "不能和 Bash Only 直接横比" },
];

export const sweTimeline = [
  {
    phase: "造题",
    points: [
      "从仓库里找被 PR 关掉的 issue。",
      "拆成金补丁和 test_patch。",
      "在「只有测试」和「测试加金补丁」两种状态下跑测试。",
      "记下 FAIL_TO_PASS 与 PASS_TO_PASS。丢掉装不上或测不稳的样本。",
    ],
  },
  {
    phase: "解题",
    points: [
      "工作区停在 base_commit。",
      "模型只拿到 problem_statement 和这棵代码树。",
      "scaffold 按自己的工具循环行动。",
      "抽出 git diff，写成预测 JSONL 的一行。",
    ],
  },
  {
    phase: "打分",
    points: [
      "换一个干净容器，仍然从 base_commit 开始。解题现场不能留下来。",
      "应用模型补丁。应用失败则该题未解决。",
      "应用 test_patch 并跑测试。",
      "解析日志，汇总 resolved 比例。报告要写数据集、scaffold、超时和 harness 版本。",
    ],
  },
];

export const sweBranches = [
  { name: "Full", text: "原始测试集，约 2294 道，12 个 Python 仓库。上面的流程就是这一套。" },
  { name: "Lite", text: "约 300 道，从 Full 抽出，方便少跑容器。字段和判分不变。Lite 的比例不能写成 Full 或 Verified。" },
  { name: "Verified", text: "约 500 道。人看过问题陈述和失败测试，说不清或测试对不上的会被拿掉。不是随机抽样，也不表示题更简单。" },
  { name: "Bash Only", text: "题就是 Verified。所有模型用同一个 mini-swe-agent，唯一动作是 bash。厂商自己的 agent 再跑一遍，不是这一列。" },
  { name: "Multimodal", text: "issue 里带截图。评测时要把图片基线放回容器。不能读图的 scaffold 看到的题目是残缺的。榜上约 517，开发集约 100，不要合成一个数字。" },
  { name: "Multilingual", text: "官方多语言切片，约 300 道、42 个仓库、9 种语言。日志解析按语言分开。" },
  { name: "Pro", text: "改动更长。解题时还有需求列表和可选的接口说明。公开、保留、商业三个子集的分数要分开报。" },
  { name: "Live", text: "用新 issue 降低整库被背下来的可能。full 按月追加，报告要写截止月份。Windows 题在 PowerShell 里打分。" },
];

export const tbV1Fields: Field[] = [
  { name: "task.yaml 里的指令", what: "任务说明，嵌在配置里", solve: "可见", grade: "不参与文本匹配" },
  { name: "task.yaml 其余项", what: "超时、资源、解析器名称", solve: "运行配置", grade: "决定怎么读测试输出" },
  { name: "Dockerfile", what: "agent 的工作容器，放在任务根目录", solve: "生活在其中", grade: "被检查的那台机器" },
  { name: "run-tests.sh", what: "验证入口，常见是跑 pytest", solve: "不可见", grade: "agent 结束后执行" },
  { name: "tests/", what: "测试与期望数据", solve: "不可见", grade: "随验证脚本运行" },
  { name: "solution.sh", what: "参考解", solve: "不可见", grade: "用来确认题本身可解" },
];

export const tbV2Fields: Field[] = [
  { name: "instruction.md", what: "任务说明，单独一个文件", solve: "可见", grade: "不参与打分文本" },
  { name: "task.toml", what: "超时、资源、要导出的 artifacts", solve: "运行配置", grade: "约束验证器能读什么" },
  { name: "environment/", what: "Dockerfile 或 compose", solve: "agent 生活在这里", grade: "被改过的现场" },
  { name: "tests/test.sh", what: "验证脚本", solve: "不可见", grade: "agent 结束后运行" },
  { name: "tests/ 其余文件", what: "pytest、期望数据", solve: "不可见", grade: "验证器可读" },
  { name: "solution/solve.sh", what: "参考解", solve: "不可见", grade: "只做 oracle，不和答案比文本" },
  { name: "reward.txt", what: "/logs/verifier/reward.txt 或 reward.json", solve: "不可见", grade: "脚本必须写下" },
];

export const tbV1Harness: Step[] = [
  { title: "拉起容器", body: "用 Dockerfile 启动，把 task.yaml 里的指令交给 agent。" },
  { title: "自由操作", body: "agent 在超时内执行命令、改文件、起进程。" },
  { title: "跑验证脚本", body: "停止或超时后，在同一环境里跑 run-tests.sh。" },
  { title: "框架解析", body: "退出码和输出交给 Terminal-Bench 仓库里的解析器，得到通过或失败。计分对象是 agent 加模型。" },
];

export const tbV2Harness: Step[] = [
  { title: "拉起工作容器", body: "按 environment/ 启动，只提供 instruction.md。" },
  { title: "在限额内操作", body: "超时和资源写在 task.toml 里。换限制就是另一次实验。" },
  { title: "独立验证", body: "tests/test.sh 可以在另一个容器里跑，只读取声明导出的 artifacts，避免 agent 改掉测试。" },
  { title: "读奖励文件", body: "脚本把 0、1 或浮点写到 reward.txt。主榜常用二元通过。" },
];

export const compareRows = [
  { dim: "起点", swe: "真实仓库的一个 commit", tb: "为题目构建的容器" },
  { dim: "完成定义", swe: "隐藏测试从失败变为通过，且原有测试仍通过", tb: "指令是否做完，由测试输出或奖励文件表示" },
  { dim: "提交物", swe: "unified diff", tb: "结束时的机器，或声明留下的文件" },
  { dim: "测试何时出现", swe: "交卷后注入 test_patch", tb: "agent 结束后才运行验证" },
  { dim: "现场", swe: "打分前丢掉，只认补丁", tb: "打分就认这台被改过的机器" },
  { dim: "报告单位", swe: "常写成模型名，实际含 scaffold", tb: "必须写成 agent 加模型" },
];
