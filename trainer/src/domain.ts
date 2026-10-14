// Типы данных тренажёра

// Задание с выбором одного варианта
export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  question: string;
  code?: string;
  options: { id: string; text: string }[];
};

// Задание с коротким текстовым ответом
export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  question: string;
  code?: string;
};

// Объединённый тип задания (discriminated union по полю kind)
export type Task = SingleChoiceTask | ShortTextTask;

// Набор заданий
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

// Ответ на задание с выбором варианта
export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

// Ответ на задание с коротким текстом
export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

// Объединённый тип ответа (discriminated union по полю kind)
export type Answer = SingleChoiceAnswer | ShortTextAnswer;

// Чистая функция: поиск задания по id.
// Возвращает задание или undefined, если не найдено.
export function findTaskById(
  tasks: readonly Task[],
  id: string,
): Task | undefined {
  return tasks.find((task) => task.id === id);
}

// Чистая функция: фильтрация заданий по теме.
// Всегда возвращает массив (возможно, пустой).
export function filterTasksByTopic(
  tasks: readonly Task[],
  topic: string,
): Task[] {
  return tasks.filter((task) => task.topic === topic);
}

// Чистая функция: подсчёт прогресса.
// Возвращает количество заполненных ответов и общее число заданий.
// Для short-text строка из пробелов не считается заполненной.
// Ответ с неизвестным taskId не влияет на прогресс.
export function countProgress(
  tasks: readonly Task[],
  answers: readonly Answer[],
): { filled: number; total: number } {
  const filled = tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    if (!answer) return false;
    if (task.kind === "short-text" && answer.kind === "short-text") {
      return answer.text.trim() !== "";
    }
    // Для single-choice любой ответ с совпадающим taskId считается заполненным
    return task.kind === "single-choice" && answer.kind === "single-choice";
  }).length;

  return { filled, total: tasks.length };
}
