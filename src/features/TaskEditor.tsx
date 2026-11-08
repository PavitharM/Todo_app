import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Copy, Archive, Trash2, Paperclip, X } from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  Label,
  CustomInput,
  Chips,
  AppButton,
  Row,
  CheckBox,
  IconButton,
  AppCard,
  ConfirmationDialog,
  EmptyState,
  ErrorState,
} from "../components/ui";
import {
  useTasks,
  useProjects,
  newTask,
  toggleTask,
  useFeedback,
} from "../store";
import { dateKey, validDate, stamp, uid } from "../utils/date";
import { Task, ChecklistItem } from "../types";
const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your task a title.")
    .max(180, "Keep your title under 180 characters."),
  description: z.string(),
  dueDate: z.string().refine(validDate, "Use a valid date: YYYY-MM-DD"),
  dueTime: z
    .string()
    .refine(
      (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      "Use 24-hour time: HH:MM",
    ),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().trim().min(1, "Add a category."),
  tags: z.string(),
  projectId: z.string(),
  reminder: z.string(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
});
type Fields = z.infer<typeof schema>;
export default function TaskEditor() {
  const { id, date, project } = useLocalSearchParams<{
    id: string;
    date?: string;
    project?: string;
  }>();
  const store = useTasks();
  const projects = useProjects((s) => s.items);
  const existing = store.items.find((t) => t.id === id);
  const [initial] = useState<Task>(
    () =>
      existing || {
        ...newTask("", date === undefined ? dateKey() : date),
        projectId: project || "",
      },
  );
  const [subtasks, setSubtasks] = useState(initial.subtasks);
  const [checklist, setChecklist] = useState(initial.checklist);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { ...initial, tags: initial.tags.join(", ") },
  });
  const values = useWatch({ control });
  const feedback = useFeedback((s) => s.show);
  if (id !== "new" && !existing)
    return (
      <Screen>
        <ScreenHeader title="Task not found" back />
        <EmptyState description="This task may have been removed." />
      </Screen>
    );
  const input = (
    name: "title" | "description" | "dueDate" | "dueTime" | "category" | "tags",
    label: string,
    placeholder?: string,
    multiline = false,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <CustomInput
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={errors[name]?.message}
          placeholder={placeholder}
          multiline={multiline}
        />
      )}
    />
  );
  const save = handleSubmit(async (fields) => {
    setBusy(true);
    const ok = await store.save({
      ...initial,
      ...existing,
      ...fields,
      tags: fields.tags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      subtasks,
      checklist,
    });
    setBusy(false);
    if (ok) {
      feedback(existing ? "Task updated" : "A fresh intention, captured.");
      router.back();
    }
  });
  return (
    <Screen>
      <ScreenHeader
        title={existing ? "Task details" : "A new intention"}
        subtitle={
          existing
            ? "Give your next step a little clarity."
            : "One small step toward a clearer day."
        }
        back
      />
      {store.error && <ErrorState message={store.error} />}
      <AppCard>
        {input("title", "TASK TITLE", "What would you like to do?")}
        {input("description", "DESCRIPTION", "Add a little context…", true)}
        <Row style={{ alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            {input("dueDate", "DUE DATE", "YYYY-MM-DD")}
          </View>
          <View style={{ flex: 1 }}>{input("dueTime", "TIME", "HH:MM")}</View>
        </Row>
        <Label size={12} muted bold>
          PRIORITY
        </Label>
        <Chips
          items={["low", "medium", "high", "urgent"]}
          value={values.priority || initial.priority}
          onChange={(v) => setValue("priority", v as Fields["priority"])}
        />
        {input("category", "CATEGORY", "Personal, Work, Learning…")}
        {input("tags", "TAGS", "design, planning")}
        <Label size={12} muted bold>
          PROJECT
        </Label>
        <Chips
          items={["No project", ...projects.map((p) => p.title)]}
          value={
            projects.find((p) => p.id === values.projectId)?.title ||
            "No project"
          }
          onChange={(v) =>
            setValue("projectId", projects.find((p) => p.title === v)?.id || "")
          }
        />
        <Label size={12} muted bold>
          REPEAT
        </Label>
        <Chips
          items={["none", "daily", "weekly", "monthly"]}
          value={values.recurrence || "none"}
          onChange={(v) => setValue("recurrence", v as Fields["recurrence"])}
        />
        <Label size={12} muted bold>
          REMINDER PREFERENCE
        </Label>
        <Chips
          items={[
            "none",
            "At time",
            "10 minutes before",
            "1 hour before",
            "1 day before",
          ]}
          value={values.reminder || "none"}
          onChange={(v) => setValue("reminder", v)}
        />
        <Label size={11} muted>
          Saved locally for planning. Device notifications are not enabled in
          this version.
        </Label>
      </AppCard>
      <ChecklistEditor
        title="Subtasks"
        items={subtasks}
        onChange={setSubtasks}
      />
      <ChecklistEditor
        title="Checklist"
        items={checklist}
        onChange={setChecklist}
      />
      <AppCard>
        <Row>
          <Paperclip size={19} color="#85859A" />
          <Label bold>Attachments</Label>
        </Row>
        <Label muted size={12}>
          File attachments will be available with the storage integration. Keep
          links in the description for now.
        </Label>
      </AppCard>
      <AppButton
        title={busy ? "Saving…" : existing ? "Save changes" : "Create task"}
        onPress={save}
        disabled={busy}
      />
      {existing && (
        <>
          <AppButton
            title={
              existing.status === "done" ? "Restore task" : "Mark complete"
            }
            variant="secondary"
            onPress={async () => {
              if (await toggleTask(existing)) router.back();
            }}
          />
          <Row style={{ flexWrap: "wrap" }}>
            <AppButton
              title="Duplicate"
              icon={Copy}
              variant="secondary"
              onPress={async () => {
                if (
                  await store.save({
                    ...existing,
                    ...stamp(),
                    title: existing.title + " (copy)",
                    status: "todo",
                    completedAt: undefined,
                    archived: false,
                  })
                ) {
                  feedback("Task duplicated");
                  router.back();
                }
              }}
            />
            <AppButton
              title={existing.archived ? "Unarchive" : "Archive"}
              icon={Archive}
              variant="secondary"
              onPress={async () => {
                if (
                  await store.save({
                    ...existing,
                    archived: !existing.archived,
                  })
                ) {
                  feedback(
                    existing.archived ? "Task unarchived" : "Task archived",
                  );
                  router.back();
                }
              }}
            />
            <IconButton
              icon={Trash2}
              label="Delete task"
              color="#EF5B65"
              onPress={() => setConfirm(true)}
            />
          </Row>
        </>
      )}
      <ConfirmationDialog
        visible={confirm}
        title="Delete this task?"
        description="This cannot be undone. The task and its checklists will be removed from this device."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          if (await store.remove(initial.id)) {
            setConfirm(false);
            feedback("Task deleted");
            router.back();
          }
        }}
      />
    </Screen>
  );
}
function ChecklistEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: ChecklistItem[];
  onChange: (v: ChecklistItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <AppCard>
      <Label bold size={17}>
        {title}
      </Label>
      {items.map((item) => (
        <Row key={item.id}>
          <CheckBox
            checked={item.done}
            label={item.title}
            onPress={() =>
              onChange(
                items.map((x) =>
                  x.id === item.id ? { ...x, done: !x.done } : x,
                ),
              )
            }
          />
          <View style={{ flex: 1 }}>
            <CustomInput
              value={item.title}
              onChangeText={(title) =>
                onChange(
                  items.map((x) => (x.id === item.id ? { ...x, title } : x)),
                )
              }
            />
          </View>
          <IconButton
            icon={X}
            label={`Remove ${item.title}`}
            onPress={() => onChange(items.filter((x) => x.id !== item.id))}
          />
        </Row>
      ))}
      <Row>
        <View style={{ flex: 1 }}>
          <CustomInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a small step…"
            onSubmitEditing={() => {
              if (draft.trim()) {
                onChange([
                  ...items,
                  { id: uid(), title: draft.trim(), done: false },
                ]);
                setDraft("");
              }
            }}
          />
        </View>
        <IconButton
          icon={Plus}
          label={`Add ${title.toLowerCase()} item`}
          onPress={() => {
            if (draft.trim()) {
              onChange([
                ...items,
                { id: uid(), title: draft.trim(), done: false },
              ]);
              setDraft("");
            }
          }}
        />
      </Row>
    </AppCard>
  );
}
