# 两份 Coding Benchmark

一个本地学习页，只讲 SWE-bench 和 Terminal-Bench：题目长什么样、解题时能看见什么、工具由谁提供、评测程序怎样判对。

## 本地运行

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 43123
```

打开 [http://127.0.0.1:43123](http://127.0.0.1:43123)。

页面上可以切换两份 benchmark、切换「解题时 / 评测时」、点开评测步骤，并在 Terminal-Bench 里切换原版和第 2 代。每份 benchmark 都有一道缩小的教学例，按公开的文件格式走完造题、交卷和打分。这些例子不是榜上的真题。规模数字若与官方榜不一致，以 swebench.com 和 Terminal-Bench 仓库为准。
