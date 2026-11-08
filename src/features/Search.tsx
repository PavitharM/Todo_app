import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowUpRight, Clock } from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  SearchBar,
  Chips,
  CustomInput,
  AppCard,
  Label,
  Row,
  Section,
  EmptyState,
} from "../components/ui";
import {
  useTasks,
  useProjects,
  useHabits,
  useNotes,
  usePreferences,
} from "../store";
import { useTheme } from "../theme";
export default function Search() {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [priority, setPriority] = useState("Any priority");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Any category");
  const tasks = useTasks((s) => s.items);
  const projects = useProjects((s) => s.items);
  const habits = useHabits((s) => s.items);
  const notes = useNotes((s) => s.items);
  const prefs = usePreferences();
  const all = [
    ...tasks
      .filter(
        (x) =>
          !x.archived &&
          (priority === "Any priority" ||
            x.priority === priority.toLowerCase()) &&
          (!date || x.dueDate === date) &&
          (category === "Any category" || x.category === category),
      )
      .map((x) => ({
        ...x,
        type: "Tasks",
        path: `/tasks/${x.id}`,
        description: x.description + " " + x.tags.join(" "),
      })),
    ...projects
      .filter(
        (x) =>
          category === "Any category" &&
          priority === "Any priority" &&
          (!date || x.deadline === date),
      )
      .map((x) => ({ ...x, type: "Projects", path: `/projects/${x.id}` })),
    ...habits
      .filter(
        () =>
          category === "Any category" && priority === "Any priority" && !date,
      )
      .map((x) => ({ ...x, type: "Habits", path: `/habits/${x.id}` })),
    ...notes
      .filter(
        (x) =>
          priority === "Any priority" &&
          (!date || x.updatedAt.slice(0, 10) === date) &&
          (category === "Any category" || x.category === category),
      )
      .map((x) => ({
        ...x,
        type: "Notes",
        path: `/notes/${x.id}`,
        description: x.body,
      })),
  ];
  const results = all.filter(
    (x) =>
      (type === "All" || type === x.type) &&
      `${x.title} ${x.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  function open(path: string) {
    if (query.trim())
      prefs.set({
        recentSearches: [
          query.trim(),
          ...prefs.recentSearches.filter((x) => x !== query.trim()),
        ].slice(0, 6),
      });
    router.push(path as any);
  }
  return (
    <Screen>
      <ScreenHeader
        title="Find your flow"
        subtitle="Everything in your space, one search away."
        back
      />
      <SearchBar value={query} onChangeText={setQuery} />
      <Chips
        items={["All", "Tasks", "Projects", "Habits", "Notes"]}
        value={type}
        onChange={setType}
      />
      <Chips
        items={["Any priority", "Urgent", "High", "Medium", "Low"]}
        value={priority}
        onChange={setPriority}
      />
      <Chips
        items={[
          "Any category",
          ...Array.from(
            new Set([
              ...tasks.map((x) => x.category),
              ...notes.map((x) => x.category),
            ]),
          ),
        ]}
        value={category}
        onChange={setCategory}
      />
      <CustomInput
        label="DATE FILTER · OPTIONAL"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />
      {!query &&
      !date &&
      priority === "Any priority" &&
      category === "Any category" &&
      type === "All" ? (
        <>
          <Section title="Recent searches" />
          {prefs.recentSearches.map((s) => (
            <Pressable
              key={s}
              onPress={() => setQuery(s)}
              style={{ padding: 10 }}
            >
              <Row>
                <Clock size={16} color={t.muted} />
                <Label>{s}</Label>
              </Row>
            </Pressable>
          ))}
          <Section title="A few places to start" />
          <Chips
            items={["design", "Personal", "Studio", "morning"]}
            value=""
            onChange={setQuery}
          />
          <EmptyState
            title="What’s on your mind?"
            description="Search tasks, projects, habits, and notes. Results appear as you type."
          />
        </>
      ) : (
        <>
          <Label muted size={12}>
            {results.length} results
          </Label>
          {results.map((item) => (
            <AppCard
              key={`${item.type}-${item.id}`}
              onPress={() => open(item.path)}
            >
              <Row>
                <View style={{ flex: 1, gap: 5 }}>
                  <Label size={10} color={t.primary} bold>
                    {item.type.toUpperCase()}
                  </Label>
                  <Label bold>{item.title}</Label>
                  <Label
                    size={12}
                    muted
                    style={{ maxHeight: 38, overflow: "hidden" }}
                  >
                    {item.description}
                  </Label>
                </View>
                <ArrowUpRight size={19} color={t.muted} />
              </Row>
            </AppCard>
          ))}
          {!results.length && (
            <EmptyState
              title="Nothing quite matches"
              description="Try a shorter phrase or clear a filter."
            />
          )}
        </>
      )}
    </Screen>
  );
}
