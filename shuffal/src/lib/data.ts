export type Difficulty = "Easy" | "Medium" | "Hard";

export type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  status: "Solved" | "Attempted" | "Unsolved";
  acceptance: number;
  description: string;
  topic: string;
};

export const problems: Problem[] = [
  {
    id: "AST-101",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    tags: ["arrays", "hash-map"],
    status: "Solved",
    acceptance: 71,
    description: "Return the indices of two numbers that add up to a target value.",
    topic: "Arrays",
  },
  {
    id: "AST-207",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    tags: ["strings", "sliding-window"],
    status: "Attempted",
    acceptance: 39,
    description: "Find the length of the longest substring without repeating characters.",
    topic: "Strings",
  },
  {
    id: "AST-312",
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "Hard",
    tags: ["binary-search", "divide-and-conquer"],
    status: "Unsolved",
    acceptance: 33,
    description: "Determine the median of two sorted arrays in O(log n) time.",
    topic: "Search",
  },
  {
    id: "AST-154",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    tags: ["stack", "strings"],
    status: "Solved",
    acceptance: 79,
    description: "Check whether a string of parentheses is valid.",
    topic: "Stacks",
  },
  {
    id: "AST-283",
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    tags: ["sorting", "intervals"],
    status: "Attempted",
    acceptance: 51,
    description: "Merge overlapping intervals into a minimal set of non-overlapping intervals.",
    topic: "Sorting",
  },
  {
    id: "AST-418",
    title: "Word Ladder",
    slug: "word-ladder",
    difficulty: "Hard",
    tags: ["graph", "bfs"],
    status: "Unsolved",
    acceptance: 29,
    description: "Find the shortest transformation sequence between two words.",
    topic: "Graph",
  },
];

export const metrics = [
  { label: "Published Problems", value: "248" },
  { label: "Registered Members", value: "1,224" },
  { label: "Accepted Submissions", value: "18.6K" },
  { label: "Active Contests", value: "12" },
];

export const featuredProblems = problems.slice(0, 3);

export const contests = [
  {
    title: "ASTRA Weekly Sprint",
    date: "18 Oct 2026",
    duration: "90 minutes",
    status: "Upcoming",
  },
  {
    title: "Dynamic Programming Duel",
    date: "25 Oct 2026",
    duration: "120 minutes",
    status: "Upcoming",
  },
  {
    title: "Graph Rush",
    date: "05 Nov 2026",
    duration: "75 minutes",
    status: "Open",
  },
];

export const leaderboard = [
  { rank: 1, name: "Ananya Sharma", solved: 142, points: 9800, streak: 18 },
  { rank: 2, name: "Rohit Verma", solved: 138, points: 9420, streak: 16 },
  { rank: 3, name: "Mansi Singh", solved: 134, points: 9115, streak: 14 },
  { rank: 4, name: "Aman Khare", solved: 128, points: 8890, streak: 12 },
];

export const submissions = [
  { id: "SUB-2401", problem: "Two Sum", language: "Python", verdict: "Accepted", time: "2 ms", memory: "14 MB", date: "2h ago" },
  { id: "SUB-2398", problem: "Median of Two Sorted Arrays", language: "C++", verdict: "Wrong Answer", time: "11 ms", memory: "18 MB", date: "Yesterday" },
  { id: "SUB-2391", problem: "Valid Parentheses", language: "Java", verdict: "Accepted", time: "4 ms", memory: "16 MB", date: "3 days ago" },
];
