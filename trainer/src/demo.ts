import type { TrainingSet, Task, Answer } from "./domain.js";
import { findTaskById, filterTasksByTopic, countProgress } from "./domain.js";

// --- Типизированные литералы заданий из контракта ---

const ts1: Task = {
  id: "ts-1",
  kind: "single-choice",
  topic: "typescript",
  question: "Какой тип описывает значение «один из нескольких вариантов»?",
  options: [
    { id: "ts-1-a", text: "interface" },
    { id: "ts-1-b", text: "union" },
    { id: "ts-1-c", text: "enum" },
  ],
};

const react1: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  question: "Какой хук возвращает текущее значение состояния?",
  code: "const [count, setCount] = ???(0);",
};

// --- Основной набор ---

export const trainingSet: TrainingSet = {
  id: "set-1",
  title: "Основы TypeScript и React",
  tasks: [ts1, react1],
};

// --- Второй набор с другими идентификаторами и темой ---

const advancedSet: TrainingSet = {
  id: "set-2",
  title: "Продвинутый TypeScript",
  tasks: [
    {
      id: "ts-adv-1",
      kind: "single-choice",
      topic: "typescript-advanced",
      question: "Что делает utility type Partial<T>?",
      options: [
        { id: "ts-adv-1-a", text: "Делает все поля обязательными" },
        { id: "ts-adv-1-b", text: "Делает все поля необязательными" },
        { id: "ts-adv-1-c", text: "Удаляет все поля" },
      ],
    },
    {
      id: "ts-adv-2",
      kind: "short-text",
      topic: "typescript-advanced",
      question: "Какое ключевое слово делает тип только для чтения?",
    },
  ],
};

// --- Пустой набор ---

const emptySet: TrainingSet = {
  id: "set-empty",
  title: "Пустой набор",
  tasks: [],
};

// --- Массив ответов ---

const answers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "ts-1-b" },
  { taskId: "react-1", kind: "short-text", text: "useState" },
];

// === Демонстрация сценариев ===

console.log("=== Поиск задания по id ===");
const found = findTaskById(trainingSet.tasks, "ts-1");
console.log("Найдено ts-1:", found?.id, found?.kind);

const notFound = findTaskById(trainingSet.tasks, "nonexistent");
console.log("Не найдено nonexistent:", notFound);

console.log("\n=== Фильтрация по теме ===");
const tsTasks = filterTasksByTopic(trainingSet.tasks, "typescript");
console.log(
  "TypeScript задания:",
  tsTasks.map((t) => t.id),
);

const noMatch = filterTasksByTopic(trainingSet.tasks, "nonexistent");
console.log("Нет совпадений:", noMatch.length);

const emptyInput = filterTasksByTopic([], "typescript");
console.log("Пустой вход:", emptyInput.length);

console.log("\n=== Подсчёт прогресса ===");

// Полный набор, все ответы на месте
const progress1 = countProgress(trainingSet.tasks, answers);
console.log("Полный набор, 2 ответа:", progress1);

// Один ответ
const progress2 = countProgress(trainingSet.tasks, [answers[0]]);
console.log("Один ответ:", progress2);

// Пустой набор
const progress3 = countProgress(emptySet.tasks, []);
console.log("Пустой набор:", progress3);

// Ответ с чужим taskId
const progress4 = countProgress(trainingSet.tasks, [
  { taskId: "unknown-task", kind: "single-choice", optionId: "x" },
]);
console.log("Чужой taskId:", progress4);

// Пробельный текст для short-text не считается заполненным
const progress5 = countProgress(trainingSet.tasks, [
  { taskId: "react-1", kind: "short-text", text: "   " },
]);
console.log("Пробельный текст:", progress5);

// === Проверка неизменности входов ===

console.log("\n=== Проверка неизменности ===");
const tasksSnapshot = JSON.stringify(trainingSet.tasks);
const answersSnapshot = JSON.stringify(answers);

findTaskById(trainingSet.tasks, "ts-1");
filterTasksByTopic(trainingSet.tasks, "typescript");
countProgress(trainingSet.tasks, answers);

const tasksAfter = JSON.stringify(trainingSet.tasks);
const answersAfter = JSON.stringify(answers);

console.log("Набор не изменён:", tasksSnapshot === tasksAfter);
console.log("Ответы не изменены:", answersSnapshot === answersAfter);
