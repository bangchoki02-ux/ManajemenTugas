
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
} from "react";

import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";

// ==========================================
// 1. INTERFACE DATA TUGAS
// ==========================================

interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  completed: boolean;
}

// ==========================================
// 2. DATA AWAL (MINIMAL 5 TUGAS)
// ==========================================

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Membuat Makalah Big Data",
    subject: "Big Data",
    description: "Membuat makalah tentang konsep Big Data dan 3V.",
    deadline: "15-11-2026",
    completed: false,
  },
  {
    id: "2",
    title: "Praktikum Pemrograman Visual",
    subject: "Pemrograman Visual",
    description: "Membuat aplikasi manajemen tugas menggunakan React Native.",
    deadline: "18-11-2026",
    completed: false,
  },
  {
    id: "3",
    title: "Tugas Kinematika Robot",
    subject: "Kinematika Robot",
    description: "Menyelesaikan perhitungan matriks transformasi robot.",
    deadline: "20-11-2026",
    completed: true,
  },
  {
    id: "4",
    title: "Membuat Database MySQL",
    subject: "Basis Data",
    description: "Membuat database dan relasi antar tabel.",
    deadline: "22-11-2026",
    completed: false,
  },
  {
    id: "5",
    title: "Laporan Analisis Sistem",
    subject: "Analisis Sistem Informasi",
    description: "Membuat laporan analisis dan perancangan sistem.",
    deadline: "25-11-2026",
    completed: true,
  },
];

// ==========================================
// 3. USE REDUCER
// ==========================================

type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_STATUS"; payload: string }
  | { type: "RESET_TASKS" };

function taskReducer(
  state: Task[],
  action: TaskAction
): Task[] {
  switch (action.type) {
    case "ADD_TASK":
      return [...state, action.payload];

    case "DELETE_TASK":
      return state.filter(
        (task) => task.id !== action.payload
      );

    case "TOGGLE_STATUS":
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, completed: !task.completed }
          : task
      );

    case "RESET_TASKS":
      return [];

    default:
      return state;
  }
}

// ==========================================
// 4. KOMPONEN ANAK: TASK CARD (PROPS)
// ==========================================

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: TaskCardProps) {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.completedTitle,
            ]}
          >
            {task.title}
          </Text>

          <Text style={styles.subject}>
            {task.subject}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            task.completed
              ? styles.statusDone
              : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: task.completed
                  ? "#15803D"
                  : "#B45309",
              },
            ]}
          >
            {task.completed ? "Selesai" : "Belum"}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {task.description}
      </Text>

      <View style={styles.deadlineContainer}>
        <Text style={styles.deadline}>
          Deadline: {task.deadline}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: task.completed
                ? "#64748B"
                : "#16A34A",
            },
          ]}
          onPress={() => onToggle(task.id)}
        >
          <Text style={styles.buttonText}>
            {task.completed
              ? "Batalkan"
              : "Selesaikan"}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: "#DC2626" },
          ]}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.buttonText}>
            Hapus
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================
// 5. KOMPONEN UTAMA APLIKASI
// ==========================================

export default function Index() {

  // USE REDUCER
  const [tasks, dispatch] = useReducer(
    taskReducer,
    INITIAL_TASKS
  );

  // USE STATE
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [search, setSearch] = useState("");

  // USE REF
  const titleInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  // USE EFFECT
  useEffect(() => {
    console.log("Keyword pencarian:", search);
  }, [search]);

  // USE MEMO: RINGKASAN TUGAS
  const summary = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.completed
    ).length;

    const pending = tasks.filter(
      (task) => !task.completed
    ).length;

    return {
      total: tasks.length,
      completed,
      pending,
    };
  }, [tasks]);

  // USE MEMO: PENCARIAN TUGAS
  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        task.subject.toLowerCase().includes(keyword)
    );
  }, [tasks, search]);

  // USE CALLBACK: TAMBAH TUGAS
  const addTask = useCallback(() => {
    if (
      !title.trim() ||
      !subject.trim() ||
      !description.trim() ||
      !deadline.trim()
    ) {
      Alert.alert(
        "Peringatan",
        "Semua kolom harus diisi!"
      );
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      deadline: deadline.trim(),
      completed: false,
    };

    dispatch({
      type: "ADD_TASK",
      payload: newTask,
    });

    // Kosongkan input
    setTitle("");
    setSubject("");
    setDescription("");
    setDeadline("");

    requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });

    Alert.alert(
      "Berhasil",
      "Tugas berhasil ditambahkan!"
    );
  }, [title, subject, description, deadline]);

  // USE CALLBACK: HAPUS TUGAS
  const deleteTask = useCallback((id: string) => {
    Alert.alert(
      "Hapus Tugas",
      "Apakah kamu yakin ingin menghapus tugas ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            dispatch({
              type: "DELETE_TASK",
              payload: id,
            });
          },
        },
      ]
    );
  }, []);

  // USE CALLBACK: UBAH STATUS
  const toggleStatus = useCallback((id: string) => {
    dispatch({
      type: "TOGGLE_STATUS",
      payload: id,
    });
  }, []);

  // USE CALLBACK: RESET SELURUH TUGAS
  const resetTasks = useCallback(() => {
    Alert.alert(
      "Reset Semua Tugas",
      "Apakah kamu yakin ingin menghapus seluruh data tugas?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "RESET_TASKS" });
          },
        },
      ]
    );
  }, []);

  // ========================================
  // 6. TAMPILAN APLIKASI
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}

        // Komponen anak menerima Props
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={toggleStatus}
            onDelete={deleteTask}
          />
        )}

        // BAGIAN HEADER
        ListHeaderComponent={
          <View>
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.appTitle}>
                  Task Manager
                </Text>
                <Text style={styles.appSubtitle}>
                  Manajemen Tugas Mahasiswa
                </Text>
              </View>
              <Text style={styles.headerIcon}>📚</Text>
            </View>

            {/* RINGKASAN */}
            <Text style={styles.sectionTitle}>
              Ringkasan Tugas
            </Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {summary.total}
                </Text>
                <Text style={styles.summaryLabel}>
                  Total
                </Text>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: "#FFF7ED" },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: "#EA580C" },
                  ]}
                >
                  {summary.pending}
                </Text>
                <Text style={styles.summaryLabel}>
                  Belum
                </Text>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: "#16A34A" },
                  ]}
                >
                  {summary.completed}
                </Text>
                <Text style={styles.summaryLabel}>
                  Selesai
                </Text>
              </View>
            </View>

            {/* FORM TAMBAH TUGAS */}
            <Text style={styles.sectionTitle}>
              Tambahkan Tugas
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                Nama Tugas
              </Text>

              <TextInput
                ref={titleInputRef}
                style={styles.input}
                placeholder="Masukkan nama tugas"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />

              <Text style={styles.inputLabel}>
                Mata Kuliah
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Masukkan mata kuliah"
                value={subject}
                onChangeText={setSubject}
              />

              <Text style={styles.inputLabel}>
                Deskripsi
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Masukkan deskripsi tugas"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>
                Deadline
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Contoh: 30-11-2026"
                value={deadline}
                onChangeText={setDeadline}
              />

              <Pressable
                style={styles.addButton}
                onPress={addTask}
              >
                <Text style={styles.addButtonText}>
                  + Tambahkan Tugas
                </Text>
              </Pressable>
            </View>

            {/* PENCARIAN */}
            <Text style={styles.sectionTitle}>
              Daftar Tugas
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama tugas atau mata kuliah..."
              value={search}
              onChangeText={setSearch}
            />

            <Text style={styles.resultText}>
              Menampilkan {filteredTasks.length} dari {tasks.length} tugas
            </Text>
          </View>
        }

        // JIKA DATA KOSONG
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
              Tugas tidak ditemukan
            </Text>
            <Text style={styles.emptySubtitle}>
              Coba gunakan kata kunci lain.
            </Text>
          </View>
        }

        // FOOTER
        ListFooterComponent={
          tasks.length > 0 ? (
            <Pressable
              style={styles.resetButton}
              onPress={resetTasks}
            >
              <Text style={styles.resetButtonText}>
                Reset Semua Tugas
              </Text>
            </Pressable>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

// ==========================================
// 7. STYLE APLIKASI
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#2563EB",
    padding: 24,
    borderRadius: 18,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  appSubtitle: {
    fontSize: 13,
    color: "#DBEAFE",
    marginTop: 5,
  },

  headerIcon: {
    fontSize: 35,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 14,
    marginTop: 5,
  },

  summaryContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    paddingVertical: 18,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#2563EB",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#475569",
    marginTop: 5,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 25,
    elevation: 2,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    padding: 12,
    fontSize: 14,
    color: "#1E293B",
  },

  textArea: {
    height: 85,
    textAlignVertical: "top",
  },

  addButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 10,
  },

  resultText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },

  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 13,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },

  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },

  completedTitle: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },

  subject: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 5,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },

  statusDone: {
    backgroundColor: "#DCFCE7",
  },

  statusPending: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },

  deadlineContainer: {
    marginTop: 12,
    marginBottom: 14,
  },

  deadline: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },

  actionContainer: {
    flexDirection: "row",
  },

  actionButton: {
    flex: 1,
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 35,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },

  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 5,
  },

  resetButton: {
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  resetButtonText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 13,
  },
});
