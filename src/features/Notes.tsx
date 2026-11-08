import React, { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Plus,
  Pin,
  ArrowUpRight,
  List,
  Grid2X2,
  Bold,
  ListTodo,
} from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  IconButton,
  SearchBar,
  Chips,
  AppCard,
  Label,
  Row,
  CustomInput,
  AppButton,
  ConfirmationDialog,
  EmptyState,
  ErrorState,
} from "../components/ui";
import { useNotes, useTasks, newTask, useFeedback } from "../store";
import { Note } from "../types";
import { stamp, shortDate, dateKey } from "../utils/date";
import { useTheme } from "../theme";
export default function Notes() {
  const t = useTheme();
  const { items, error } = useNotes();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [grid, setGrid] = useState(true);
  const width = useWindowDimensions().width;
  const notes = items
    .filter(
      (n) =>
        `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()) &&
        (category === "All" || n.category === category),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <Screen>
      <ScreenHeader
        title="A place for your thoughts"
        subtitle="Catch an idea before it drifts away."
        back
        right={
          <IconButton
            icon={Plus}
            label="New note"
            onPress={() => router.push("/notes/new")}
          />
        }
      />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search your notes…"
      />
      <Row>
        <View style={{ flex: 1 }}>
          <Chips
            items={[
              "All",
              ...Array.from(new Set(items.map((n) => n.category))),
            ]}
            value={category}
            onChange={setCategory}
          />
        </View>
        <IconButton
          icon={grid ? List : Grid2X2}
          label="Toggle note layout"
          onPress={() => setGrid(!grid)}
        />
      </Row>
      {error && <ErrorState message={error} />}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        {notes.map((note, i) => (
          <View
            key={note.id}
            style={{ width: grid && width > 600 ? "48.5%" : "100%" }}
          >
            <AppCard
              onPress={() => router.push(`/notes/${note.id}`)}
              style={{
                backgroundColor: t.dark
                  ? t.surface
                  : i % 3 === 0
                    ? "#F1EEFC"
                    : i % 3 === 1
                      ? "#F8F2E8"
                      : "#EDF5F1",
                minHeight: grid ? 190 : 100,
              }}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <Label size={11} color={t.primary} bold>
                  {note.category.toUpperCase()}
                </Label>
                {note.pinned && <Pin size={15} color={t.primary} />}
              </Row>
              <Label bold size={19}>
                {note.title}
              </Label>
              <Label
                size={13}
                muted
                style={{ maxHeight: grid ? 85 : 40, overflow: "hidden" }}
              >
                {note.body}
              </Label>
              <Row style={{ justifyContent: "space-between", marginTop: 8 }}>
                <Label size={10} muted>
                  {shortDate(dateKey(new Date(note.updatedAt)))}
                </Label>
                <ArrowUpRight size={17} color={t.muted} />
              </Row>
            </AppCard>
          </View>
        ))}
      </View>
      {!notes.length && (
        <EmptyState
          title={query ? "No matching thoughts" : "Your next idea belongs here"}
          action={
            <AppButton
              title="Write a note"
              onPress={() => router.push("/notes/new")}
            />
          }
        />
      )}
    </Screen>
  );
}
export function NoteEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useNotes();
  const existing = store.items.find((n) => n.id === id);
  const [draft, setDraft] = useState<Note>(
    existing || {
      ...stamp(),
      title: "",
      body: "",
      category: "Personal",
      pinned: false,
    },
  );
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  if (id !== "new" && !existing)
    return (
      <Screen>
        <ScreenHeader title="Note not found" back />
        <EmptyState />
      </Screen>
    );
  function insert(prefix: string, suffix = "") {
    const selected = draft.body.slice(selection.start, selection.end);
    const body =
      draft.body.slice(0, selection.start) +
      prefix +
      selected +
      suffix +
      draft.body.slice(selection.end);
    setDraft({ ...draft, body });
  }
  async function save() {
    if (!draft.title.trim()) return setError("Give this thought a title.");
    if (await store.save({ ...draft, title: draft.title.trim() })) {
      useFeedback.getState().show("Thought saved");
      router.back();
    } else setError("Could not save. Please retry.");
  }
  return (
    <Screen>
      <ScreenHeader
        title={existing ? "Your thought" : "A fresh page"}
        back
        right={
          <IconButton
            icon={Pin}
            label={draft.pinned ? "Unpin note" : "Pin note"}
            color={draft.pinned ? "#7165E8" : undefined}
            onPress={() => setDraft({ ...draft, pinned: !draft.pinned })}
          />
        }
      />
      <CustomInput
        label="TITLE"
        placeholder="What’s on your mind?"
        value={draft.title}
        onChangeText={(title) => setDraft({ ...draft, title })}
      />
      <CustomInput
        label="CATEGORY"
        value={draft.category}
        onChangeText={(category) => setDraft({ ...draft, category })}
      />
      <AppCard>
        <Row>
          <IconButton
            icon={Bold}
            label="Insert bold markdown"
            onPress={() => insert("**", "**")}
          />
          <IconButton
            icon={ListTodo}
            label="Insert bullet"
            onPress={() => insert("\n• ")}
          />
          <Label muted size={11}>
            Plain text · Markdown-friendly
          </Label>
        </Row>
        <CustomInput
          multiline
          placeholder="Let your thoughts wander…"
          value={draft.body}
          onChangeText={(body) => setDraft({ ...draft, body })}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          style={{
            minHeight: 300,
            borderWidth: 0,
            padding: 4,
            fontSize: 16,
            lineHeight: 27,
          }}
        />
      </AppCard>
      {error && <Label color="#EF5B65">{error}</Label>}
      <AppButton title="Save note" onPress={save} />
      <AppButton
        title="Turn into a task"
        variant="secondary"
        onPress={async () => {
          if (!draft.title.trim())
            return setError("Add a title before creating a task.");
          const task = {
            ...newTask(draft.title),
            description: draft.body,
            category: draft.category || "Personal",
          };
          if (await useTasks.getState().save(task)) {
            if (await store.save(draft)) {
              useFeedback.getState().show("Note saved and task created");
              router.replace(`/tasks/${task.id}`);
            }
          } else setError("Could not create task. Please retry.");
        }}
      />
      {existing && (
        <AppButton
          title="Delete note"
          variant="danger"
          onPress={() => setConfirm(true)}
        />
      )}
      <ConfirmationDialog
        visible={confirm}
        title="Delete this note?"
        description="This thought will be permanently removed from your device."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          if (await store.remove(id)) {
            setConfirm(false);
            router.back();
          }
        }}
      />
    </Screen>
  );
}
