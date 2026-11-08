import React, { useState, useRef } from "react";
import { View, ScrollView, PanResponder, Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react-native";
import {
  ColorPicker,
  Screen,
  ScreenHeader,
  Chips,
  IconButton,
  Label,
  AppCard,
  AppButton,
  CustomInput,
  CustomModal,
  Row,
  ProgressBar,
  EmptyState,
  ConfirmationDialog,
  ErrorState,
} from "../components/ui";
import { ProjectCard, TaskCard } from "../components/cards";
import { useProjects, useTasks, useFeedback } from "../store";
import { Project, Task, TaskStatus } from "../types";
import { stamp, dateKey, validDate } from "../utils/date";
import { useTheme } from "../theme";
export const colors = [
  "#7165E8",
  "#36B37E",
  "#F5A623",
  "#EF5B65",
  "#4A9BCE",
  "#C079BE",
];
export default function Projects() {
  const { items, error } = useProjects();
  const [filter, setFilter] = useState("Active");
  const [open, setOpen] = useState(false);
  return (
    <Screen>
      <ScreenHeader
        title="Your projects"
        subtitle="Turn big ideas into small, meaningful steps."
        back
        right={
          <IconButton
            icon={Plus}
            label="Create project"
            onPress={() => setOpen(true)}
          />
        }
      />
      <Chips
        items={["All", "Active", "Completed"]}
        value={filter}
        onChange={setFilter}
      />
      {error && <ErrorState message={error} />}
      <View style={{ gap: 16 }}>
        {items
          .filter((p) => filter === "All" || p.status === filter.toLowerCase())
          .map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
      </View>
      {!items.filter(
        (p) => filter === "All" || p.status === filter.toLowerCase(),
      ).length && (
        <EmptyState
          action={
            <AppButton title="Create project" onPress={() => setOpen(true)} />
          }
        />
      )}
      <ProjectEditor visible={open} onClose={() => setOpen(false)} />
    </Screen>
  );
}
export function ProjectEditor({
  visible,
  onClose,
  project,
}: {
  visible: boolean;
  onClose: () => void;
  project?: Project;
}) {
  const [draft, setDraft] = useState<Project>(
    project || {
      ...stamp(),
      title: "",
      description: "",
      icon: "Layers",
      color: colors[0],
      startDate: dateKey(),
      deadline: "",
      status: "active",
    },
  );
  const [error, setError] = useState("");
  function field(key: keyof Project, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={project ? "Edit project" : "A new possibility"}
    >
      <CustomInput
        label="PROJECT NAME"
        value={draft.title}
        onChangeText={(v) => field("title", v)}
      />
      <CustomInput
        label="DESCRIPTION"
        multiline
        value={draft.description}
        onChangeText={(v) => field("description", v)}
      />
      <Label muted size={12}>
        COLOR
      </Label>
      <ColorPicker
        colors={colors}
        value={draft.color}
        onChange={(v) => field("color", v)}
      />
      <Label muted size={12}>
        ICON
      </Label>
      <Chips
        items={["Layers", "Heart", "Sun", "Book", "Briefcase"]}
        value={draft.icon}
        onChange={(v) => field("icon", v)}
      />
      <CustomInput
        label="START DATE · YYYY-MM-DD"
        value={draft.startDate}
        onChangeText={(v) => field("startDate", v)}
      />
      <CustomInput
        label="DEADLINE · YYYY-MM-DD"
        value={draft.deadline}
        onChangeText={(v) => field("deadline", v)}
      />
      <Chips
        items={["active", "completed"]}
        value={draft.status}
        onChange={(v) => field("status", v)}
      />
      {error && <Label color="#EF5B65">{error}</Label>}
      <AppButton
        title="Save project"
        onPress={async () => {
          if (!draft.title.trim()) return setError("Give your project a name.");
          if (!validDate(draft.startDate) || !validDate(draft.deadline))
            return setError("Enter valid dates in YYYY-MM-DD format.");
          if (
            draft.startDate &&
            draft.deadline &&
            draft.startDate > draft.deadline
          )
            return setError("The deadline must follow the start date.");
          if (
            await useProjects
              .getState()
              .save({ ...draft, title: draft.title.trim() })
          ) {
            useFeedback.getState().show("Project saved");
            onClose();
          } else setError("Could not save. Please retry.");
        }}
      />
    </CustomModal>
  );
}
const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "progress", title: "In progress" },
  { status: "done", title: "Done" },
];
export function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const store = useProjects();
  const project = store.items.find((p) => p.id === id);
  const tasks = useTasks((s) => s.items).filter(
    (x) => x.projectId === id && !x.archived,
  );
  const [view, setView] = useState("List");
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const rects = useRef<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  const refs = useRef<Record<string, React.ElementRef<typeof View> | null>>({});
  const done = tasks.filter((x) => x.status === "done").length;
  async function move(task: Task, status: TaskStatus) {
    await useTasks.getState().save({
      ...task,
      status,
      completedAt: status === "done" ? new Date().toISOString() : undefined,
    });
  }
  function measure() {
    Object.entries(refs.current).forEach(([key, node]) =>
      node?.measureInWindow((x, y, width, height) => {
        rects.current[key] = { x, y, width, height };
      }),
    );
  }
  if (!project)
    return (
      <Screen>
        <ScreenHeader title="Project not found" back />
        <EmptyState />
      </Screen>
    );
  return (
    <Screen>
      <ScreenHeader
        title={project.title}
        subtitle={
          project.status === "active"
            ? "An idea, becoming real."
            : "A chapter, completed."
        }
        back
        right={
          <IconButton
            icon={Pencil}
            label="Edit project"
            onPress={() => setEdit(true)}
          />
        }
      />
      <AppCard>
        <Label muted>
          {project.description ||
            "Every great project starts with one small step."}
        </Label>
        <Row style={{ justifyContent: "space-between" }}>
          <Label bold>
            {tasks.length ? Math.round((done / tasks.length) * 100) : 0}%
            complete
          </Label>
          <Label size={12} muted>
            {done} / {tasks.length} tasks
          </Label>
        </Row>
        <ProgressBar
          value={tasks.length ? (done / tasks.length) * 100 : 0}
          color={project.color}
        />
        <Label size={12} muted>
          {project.startDate || "No start date"} →{" "}
          {project.deadline || "No deadline"}
        </Label>
      </AppCard>
      <Row style={{ justifyContent: "space-between" }}>
        <Chips items={["List", "Board"]} value={view} onChange={setView} />
        <IconButton
          icon={Plus}
          label="Add project task"
          onPress={() =>
            router.push({ pathname: "/tasks/new", params: { project: id } })
          }
        />
      </Row>
      {view === "List" ? (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      ) : (
        <>
          <Label size={12} muted>
            Drag a card to another column, or use its arrow controls.
          </Label>
          <ScrollView
            horizontal
            onScroll={measure}
            scrollEventThrottle={100}
            contentContainerStyle={{
              gap: 14,
              paddingBottom: 25,
              paddingTop: 8,
            }}
          >
            {columns.map((column, i) => (
              <View
                key={column.status}
                ref={(node) => {
                  refs.current[column.status] = node;
                }}
                onLayout={measure}
                style={{
                  width: 255,
                  minHeight: 300,
                  backgroundColor: t.elevated,
                  borderRadius: 18,
                  padding: 12,
                  gap: 12,
                }}
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <Label bold>{column.title}</Label>
                  <Label muted>
                    {
                      tasks.filter((task) => task.status === column.status)
                        .length
                    }
                  </Label>
                </Row>
                {tasks
                  .filter((task) => task.status === column.status)
                  .map((task) => (
                    <Draggable
                      key={task.id}
                      onStart={measure}
                      onDrop={(x, y) => {
                        const hit = Object.entries(rects.current).find(
                          ([, r]) =>
                            x >= r.x &&
                            x <= r.x + r.width &&
                            y >= r.y &&
                            y <= r.y + r.height,
                        );
                        if (hit) move(task, hit[0] as TaskStatus);
                      }}
                    >
                      <AppCard
                        onPress={() => router.push(`/tasks/${task.id}`)}
                        style={{ padding: 14 }}
                      >
                        <Label bold>{task.title}</Label>
                        <Label size={11} muted>
                          {task.category}
                        </Label>
                        <Row style={{ justifyContent: "space-between" }}>
                          {i > 0 ? (
                            <IconButton
                              icon={ArrowLeft}
                              label={`Move ${task.title} to ${columns[i - 1].title}`}
                              onPress={() => move(task, columns[i - 1].status)}
                            />
                          ) : (
                            <View />
                          )}
                          {i < 2 && (
                            <IconButton
                              icon={ArrowRight}
                              label={`Move ${task.title} to ${columns[i + 1].title}`}
                              onPress={() => move(task, columns[i + 1].status)}
                            />
                          )}
                        </Row>
                      </AppCard>
                    </Draggable>
                  ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
      {!tasks.length && (
        <EmptyState
          title="The first step is yours"
          action={
            <AppButton
              title="Add a task"
              onPress={() =>
                router.push({ pathname: "/tasks/new", params: { project: id } })
              }
            />
          }
        />
      )}
      <AppButton
        title="Delete project"
        variant="danger"
        icon={Trash2}
        onPress={() => setConfirm(true)}
      />
      {edit && (
        <ProjectEditor
          visible
          onClose={() => setEdit(false)}
          project={project}
        />
      )}
      <ConfirmationDialog
        visible={confirm}
        title="Delete this project?"
        description="Your tasks will be kept and moved out of this project."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          for (const task of useTasks
            .getState()
            .items.filter((x) => x.projectId === id)) {
            if (!(await useTasks.getState().save({ ...task, projectId: "" })))
              return;
          }
          if (await store.remove(id)) {
            setConfirm(false);
            router.back();
          }
        }}
      />
    </Screen>
  );
}
function Draggable({
  children,
  onDrop,
  onStart,
}: React.PropsWithChildren<{
  onDrop: (x: number, y: number) => void;
  onStart: () => void;
}>) {
  const [pan] = useState(() => new Animated.ValueXY());
  const [dragging, setDragging] = useState(false);
  const handlers = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12,
    onPanResponderGrant: () => {
      onStart();
      setDragging(true);
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, g) => {
      onDrop(g.moveX, g.moveY);
      pan.setValue({ x: 0, y: 0 });
      setDragging(false);
    },
    onPanResponderTerminate: () => {
      pan.setValue({ x: 0, y: 0 });
      setDragging(false);
    },
  });
  return (
    <Animated.View
      {...handlers.panHandlers}
      style={{
        transform: pan.getTranslateTransform(),
        zIndex: dragging ? 100 : 1,
        opacity: dragging ? 0.85 : 1,
      }}
    >
      {children}
    </Animated.View>
  );
}
