import { useState, useMemo } from "react";
import type { Task, TrainingSet, Answer } from "./domain.js";
import { findTaskById } from "./domain.js";
import { trainingSet } from "./demo.js";

// --- Утилиты ---
function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}

function replaceAnswer(
  current: readonly Answer[],
  next: Answer,
): Answer[] {
  return [
    ...current.filter((item) => item.taskId !== next.taskId),
    next,
  ];
}

// --- Заголовок модуля с прогрессом ---
type ModuleHeaderProps = {
  title: string;
  answered: number;
  total: number;
};

export function ModuleHeader({ title, answered, total }: ModuleHeaderProps) {
  return (
    <header className="module-header">
      <h1 className="module-title">{title}</h1>
      <p className="module-count">
        Заполнено: {answered} из {total}
      </p>
    </header>
  );
}

// --- Список заданий с прогрессом ---
type TaskListProps = {
  tasks: readonly Task[];
  currentIndex: number;
  answers: readonly Answer[];
  onSelect: (index: number) => void;
};

export function TaskList({
  tasks,
  currentIndex,
  answers,
  onSelect,
}: TaskListProps) {
  return (
    <nav aria-label="Список заданий">
      <ul className="task-list">
        {tasks.map((task, index) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = isAnswered(answer);
          const isCurrent = index === currentIndex;
          return (
            <li key={task.id}>
              <button
                type="button"
                className={
                  "task-list-item" +
                  (isCurrent ? " is-current" : "") +
                  (filled ? " is-filled" : "")
                }
                onClick={() => onSelect(index)}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="task-list-number">{index + 1}</span>
                <span className="task-list-question">{task.question}</span>
                <span className="task-list-status">
                  {filled ? "✓" : "○"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// --- Форма задания (controlled) ---
type TaskFormProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  disabled: boolean;
};

export function TaskForm({ task, answer, onChange, disabled }: TaskFormProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset className="task-form" disabled={disabled}>
        <legend className="task-form-legend">Выберите один вариант:</legend>
        <ul className="task-form-options">
          {task.options.map((option) => {
            const isChecked =
              answer?.kind === "single-choice" &&
              answer.optionId === option.id;
            return (
              <li key={option.id} className="task-form-option">
                <label className="task-form-label">
                  <input
                    type="radio"
                    name={task.id}
                    value={option.id}
                    checked={isChecked}
                    onChange={() =>
                      onChange({
                        taskId: task.id,
                        kind: "single-choice",
                        optionId: option.id,
                      })
                    }
                  />
                  <span className="task-form-option-text">
                    {option.text}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    );
  }

  return (
    <div className="task-form">
      <label className="task-form-label" htmlFor={`text-${task.id}`}>
        Введите короткий ответ:
        <textarea
          id={`text-${task.id}`}
          className="task-form-textarea"
          value={answer?.kind === "short-text" ? answer.text : ""}
          onChange={(event) =>
            onChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value,
            })
          }
          disabled={disabled}
          rows={4}
        />
      </label>
    </div>
  );
}

// --- Карточка задания ---
type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  disabled: boolean;
};

export function TaskCard({
  task,
  answer,
  onChange,
  disabled,
}: TaskCardProps) {
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

      <TaskForm
        task={task}
        answer={answer}
        onChange={onChange}
        disabled={disabled}
      />
    </article>
  );
}

// --- Навигация ---
type NavigationProps = {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  disabled: boolean;
};

export function Navigation({
  currentIndex,
  total,
  onPrev,
  onNext,
  onFinish,
  disabled,
}: NavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <nav className="navigation" aria-label="Навигация по заданиям">
      <button
        type="button"
        className="nav-button"
        onClick={onPrev}
        disabled={isFirst || disabled}
      >
        ← Назад
      </button>
      <span className="nav-counter">
        {currentIndex + 1} / {total}
      </span>
      {isLast ? (
        <button
          type="button"
          className="nav-button nav-button-finish"
          onClick={onFinish}
          disabled={disabled}
        >
          Завершить
        </button>
      ) : (
        <button
          type="button"
          className="nav-button"
          onClick={onNext}
          disabled={disabled}
        >
          Далее →
        </button>
      )}
    </nav>
  );
}

// --- Предупреждение о пропущенных заданиях ---
type WarningModalProps = {
  unanswered: readonly Task[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function WarningModal({
  unanswered,
  onConfirm,
  onCancel,
}: WarningModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal-title">Есть незаполненные задания</h2>
        <p className="modal-text">
          Вы не ответили на {unanswered.length}{" "}
          {unanswered.length === 1
            ? "задание"
            : unanswered.length < 5
              ? "задания"
              : "заданий"}
          :
        </p>
        <ul className="modal-list">
          {unanswered.map((task, index) => (
            <li key={task.id}>
              {index + 1}. {task.question}
            </li>
          ))}
        </ul>
        <p className="modal-text">
          Всё равно завершить попытку?
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="modal-button modal-button-cancel"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="modal-button modal-button-confirm"
            onClick={onConfirm}
          >
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Обзор ответов ---
type ReviewProps = {
  tasks: readonly Task[];
  answers: readonly Answer[];
  onRestart: () => void;
};

export function Review({ tasks, answers, onRestart }: ReviewProps) {
  return (
    <div className="review">
      <h2 className="review-title">Обзор ответов</h2>
      <ul className="review-list">
        {tasks.map((task, index) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = isAnswered(answer);
          return (
            <li key={task.id} className="review-item">
              <div className="review-item-header">
                <span className="review-item-number">{index + 1}.</span>
                <span className="review-item-topic">{task.topic}</span>
                <span
                  className={
                    "review-item-status" +
                    (filled ? " is-filled" : " is-empty")
                  }
                >
                  {filled ? "Заполнено" : "Пропущено"}
                </span>
              </div>
              <p className="review-item-question">{task.question}</p>
              {task.code !== undefined && (
                <pre className="review-item-code">
                  <code>{task.code}</code>
                </pre>
              )}
              <div className="review-item-answer">
                {answer?.kind === "single-choice" && task.kind === "single-choice" ? (
                  <span>
                    Вариант:{" "}
                    {task.options.find((o) => o.id === answer.optionId)?.text ?? "—"}
                  </span>
                ) : answer?.kind === "short-text" ? (
                  <span>
                    Ответ:{" "}
                    {answer.text.trim().length > 0 ? answer.text : "—"}
                  </span>
                ) : (
                  <span className="review-item-empty">Нет ответа</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="review-restart"
        onClick={onRestart}
      >
        Начать новую попытку
      </button>
    </div>
  );
}

// --- Пустое состояние ---
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

  const [answers, setAnswers] = useState<readonly Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"active" | "submitted">("active");
  const [showWarning, setShowWarning] = useState(false);

  const currentTask =
    status === "active" && tasks.length > 0
      ? tasks[currentIndex]
      : undefined;

  const currentAnswer =
    currentTask !== undefined
      ? answers.find((a) => a.taskId === currentTask.id)
      : undefined;

  const answeredCount = useMemo(
    () =>
      tasks.reduce(
        (count, task) =>
          count + (isAnswered(answers.find((a) => a.taskId === task.id)) ? 1 : 0),
        0,
      ),
    [tasks, answers],
  );

  const unansweredTasks = useMemo(
    () => tasks.filter((task) => !isAnswered(answers.find((a) => a.taskId === task.id))),
    [tasks, answers],
  );

  const handleAnswerChange = (answer: Answer) => {
    setAnswers((current) => replaceAnswer(current, answer));
  };

  const handleSelect = (index: number) => {
    if (status === "active") {
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((index) => Math.min(index + 1, tasks.length - 1));
  };

  const handleFinish = () => {
    if (unansweredTasks.length > 0) {
      setShowWarning(true);
    } else {
      setStatus("submitted");
    }
  };

  const handleConfirmFinish = () => {
    setShowWarning(false);
    setStatus("submitted");
  };

  const handleCancelFinish = () => {
    setShowWarning(false);
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("active");
    setShowWarning(false);
  };

  if (tasks.length === 0) {
    return (
      <div className="app">
        <ModuleHeader title={trainingModule.title} answered={0} total={0} />
        <EmptyState message="В этом модуле пока нет заданий." />
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="app">
        <ModuleHeader
          title={trainingModule.title}
          answered={answeredCount}
          total={tasks.length}
        />
        <Review
          tasks={tasks}
          answers={answers}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <ModuleHeader
        title={trainingModule.title}
        answered={answeredCount}
        total={tasks.length}
      />
      <div className="app-layout">
        <TaskList
          tasks={tasks}
          currentIndex={currentIndex}
          answers={answers}
          onSelect={handleSelect}
        />
        <div className="app-main">
          {currentTask !== undefined ? (
            <TaskCard
              task={currentTask}
              answer={currentAnswer}
              onChange={handleAnswerChange}
              disabled={false}
            />
          ) : (
            <EmptyState message="Задание не найдено." />
          )}
          <Navigation
            currentIndex={currentIndex}
            total={tasks.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinish}
            disabled={false}
          />
        </div>
      </div>
      {showWarning && (
        <WarningModal
          unanswered={unansweredTasks}
          onConfirm={handleConfirmFinish}
          onCancel={handleCancelFinish}
        />
      )}
    </div>
  );
}