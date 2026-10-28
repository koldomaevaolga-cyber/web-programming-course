import { useState } from "react";
import type { Task, TrainingSet } from "./domain.js";
import { findTaskById } from "./domain.js";
import { trainingSet } from "./demo.js";

// --- Список заданий ---
type TaskListProps = {
  tasks: readonly Task[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  return (
    <nav aria-label="Список заданий">
      <ul className="task-list">
        {tasks.map((task) => {
          const isSelected = task.id === selectedId;
          return (
            <li key={task.id}>
              <button
                type="button"
                className={
                  "task-list-item" + (isSelected ? " is-selected" : "")
                }
                onClick={() => onSelect(task.id)}
                aria-current={isSelected ? "step" : undefined}
              >
                <span className="task-list-kind">
                  {task.kind === "single-choice" ? "Выбор" : "Текст"}
                </span>
                <span className="task-list-question">{task.question}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// --- Карточка одного задания ---
type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <header className="task-card-header">
        <span className="task-card-topic">{task.topic}</span>
        <span className="task-card-kind">{task.kind}</span>
      </header>

      <h2 className="task-card-question">{task.question}</h2>

      {task.code !== undefined && (
        <pre className="task-card-code">
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <ul className="task-card-options">
          {task.options.map((option) => (
            <li key={option.id} className="task-card-option">
              <span className="task-card-option-id">{option.id}.</span>
              <span className="task-card-option-text">{option.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="task-card-hint">
          Это задание с коротким текстовым ответом.
        </p>
      )}
    </article>
  );
}

// --- Заголовок модуля ---
type ModuleHeaderProps = {
  title: string;
  total: number;
};

export function ModuleHeader({ title, total }: ModuleHeaderProps) {
  return (
    <header className="module-header">
      <h1 className="module-title">{title}</h1>
      <p className="module-count">Заданий: {total}</p>
    </header>
  );
}

// --- Нейтральное пустое состояние ---
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state" role="status">
      <p>{message}</p>
    </div>
  );
}

// --- Корневой компонент ---
export function App() {
  const trainingModule: TrainingSet = trainingSet;
  const tasks = trainingModule.tasks;

  const [selectedId, setSelectedId] = useState<string | undefined>(
    tasks[0]?.id,
  );

  const currentTask =
    selectedId !== undefined ? findTaskById(tasks, selectedId) : undefined;

  if (tasks.length === 0) {
    return (
      <div className="app">
        <ModuleHeader title={trainingModule.title} total={0} />
        <EmptyState message="В этом модуле пока нет заданий." />
      </div>
    );
  }

  return (
    <div className="app">
      <ModuleHeader title={trainingModule.title} total={tasks.length} />
      <div className="app-layout">
        <TaskList
          tasks={tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {currentTask !== undefined ? (
          <TaskCard task={currentTask} />
        ) : (
          <EmptyState message="Задание не найдено. Выберите задание из списка." />
        )}
      </div>
    </div>
  );
}