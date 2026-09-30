import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'task-manager.tasks'
const AUTH_KEY = 'task-manager.authenticated'

function dateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createSeedTasks() {
  const now = Date.now()
  return [
    {
      id: 'task-01',
      title: 'Finalize research proposal',
      description: 'Bring the literature review and methodology into one polished draft for the supervisor meeting.',
      priority: 'High',
      category: 'Academic',
      raisedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      dueDate: dateOffset(1),
      status: 'Pending',
    },
    {
      id: 'task-02',
      title: 'Review statistics lecture notes',
      description: 'Revisit hypothesis testing and work through the practice questions from week six.',
      priority: 'Medium',
      category: 'Academic',
      raisedAt: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
      dueDate: dateOffset(3),
      status: 'Raised',
    },
    {
      id: 'task-03',
      title: 'Book a dentist appointment',
      description: 'Find an appointment that works around the lab schedule.',
      priority: 'Low',
      category: 'Personal',
      raisedAt: new Date(now - 1000 * 60 * 60 * 76).toISOString(),
      dueDate: dateOffset(5),
      status: 'Pending',
    },
    {
      id: 'task-04',
      title: 'Submit design assignment',
      description: 'Upload the final prototype and short reflection to the course portal.',
      priority: 'High',
      category: 'Academic',
      raisedAt: new Date(now - 1000 * 60 * 60 * 100).toISOString(),
      dueDate: dateOffset(-1),
      status: 'Closed',
    },
  ]
}

function readTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    return savedTasks ? JSON.parse(savedTasks) : createSeedTasks()
  } catch {
    return createSeedTasks()
  }
}

function formatDate(dateValue, options = { month: 'short', day: 'numeric' }) {
  if (!dateValue) return 'No date'
  return new Intl.DateTimeFormat('en', options).format(new Date(`${dateValue.slice(0, 10)}T12:00:00`))
}

function formatRaisedAt(dateValue) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

function App() {
  const [tasks, setTasks] = useState(readTasks)
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) !== 'false',
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function saveTask(task) {
    setTasks((currentTasks) => {
      const exists = currentTasks.some((item) => item.id === task.id)
      return exists
        ? currentTasks.map((item) => (item.id === task.id ? task : item))
        : [task, ...currentTasks]
    })
  }

  function updateStatus(taskId, status) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    )
  }

  function deleteTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => setAuthenticated(true)} />} />
        <Route element={<ProtectedRoute authenticated={authenticated} onLogout={() => setAuthenticated(false)} />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage tasks={tasks} />} />
            <Route path="tasks" element={<TasksPage tasks={tasks} onStatusChange={updateStatus} onDelete={deleteTask} />} />
            <Route path="tasks/new" element={<TaskFormPage onSave={saveTask} />} />
            <Route path="tasks/:taskId" element={<TaskDetailsPage tasks={tasks} onStatusChange={updateStatus} onDelete={deleteTask} />} />
            <Route path="tasks/:taskId/edit" element={<TaskFormPage tasks={tasks} onSave={saveTask} />} />
            <Route path="completed" element={<TasksPage tasks={tasks} onStatusChange={updateStatus} onDelete={deleteTask} completedOnly />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedRoute({ authenticated, onLogout }) {
  if (!authenticated) return <Navigate to="/login" replace />
  return <Outlet context={{ onLogout }} />
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate()

  function login(event) {
    event.preventDefault()
    localStorage.setItem(AUTH_KEY, 'true')
    onLogin()
    navigate('/', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark"><ListTodo size={21} /></div>
        <span className="eyebrow">DAYMARK / TASK MANAGER</span>
        <h1>Make room for the work that matters.</h1>
        <p className="login-copy">Sign in to pick up where you left off.</p>
        <form onSubmit={login} className="login-form">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" defaultValue="souvik@example.com" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" defaultValue="daymark" required />
          <button className="button button-primary login-submit" type="submit">Continue <ArrowRight size={16} /></button>
        </form>
        <p className="login-footnote"><ShieldCheck size={15} /> Demo access, no account required</p>
      </section>
      <aside className="login-aside">
        <div className="aside-note"><Sparkles size={17} /> A calmer way to keep your day in view</div>
        <div className="login-quote">“Small steps, done with intention, become remarkable progress.”</div>
        <div className="login-aside-bottom"><span>DAYMARK</span><span>01 / 04</span></div>
      </aside>
    </main>
  )
}

function AppShell() {
  const { onLogout } = useOutletContext()

  function logout() {
    localStorage.setItem(AUTH_KEY, 'false')
    onLogout()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/"><span className="brand-mark"><ListTodo size={20} /></span><span>daymark<span className="brand-period">.</span></span></Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><LayoutDashboard size={17} /> Overview</NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><ListTodo size={17} /> All tasks</NavLink>
          <NavLink to="/completed" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><CheckCircle2 size={17} /> Completed</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-date"><CalendarDays size={15} /><span>{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span></div>
          <button className="profile-button" type="button" onClick={logout} title="Sign out"><span className="avatar">S</span><span className="profile-copy"><strong>Souvik Baidya</strong><small>Personal workspace</small></span><LogOut size={15} /></button>
        </div>
      </aside>
      <main className="main-area"><Outlet /></main>
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-header">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action}
    </header>
  )
}

function DashboardPage({ tasks }) {
  const pending = tasks.filter((task) => task.status !== 'Closed')
  const completed = tasks.filter((task) => task.status === 'Closed')
  const dueSoon = pending.filter((task) => task.dueDate >= dateOffset(0) && task.dueDate <= dateOffset(3))
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="page-content dashboard-page">
      <PageHeader eyebrow={`YOUR SPACE  /  ${today.toUpperCase()}`} title="A little progress, every day." description="Here's the shape of your day. Pick a place to begin." action={<Link className="button button-primary" to="/tasks/new"><Plus size={17} /> New task</Link>} />
      <section className="welcome-strip"><div className="welcome-icon"><Sparkles size={18} /></div><div><strong>You’ve got this.</strong><span>{pending.length === 0 ? 'Your list is clear. Enjoy the breathing room.' : `${pending.length} open ${pending.length === 1 ? 'task' : 'tasks'} are moving at your pace.`}</span></div><Link to="/tasks">View your list <ArrowRight size={15} /></Link></section>
      <section className="stats-grid" aria-label="Task summary">
        <StatCard icon={<Target size={18} />} label="Open tasks" value={pending.length} note="Across all categories" tone="mint" />
        <StatCard icon={<Clock3 size={18} />} label="Due soon" value={dueSoon.length} note="Within the next 3 days" tone="coral" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Completed" value={completed.length} note="Nicely done" tone="blue" />
      </section>
      <div className="dashboard-columns">
        <section className="content-section task-preview-section">
          <div className="section-heading"><div><span className="section-kicker">IN MOTION</span><h2>Up next</h2></div><Link className="text-link" to="/tasks">All tasks <ArrowRight size={15} /></Link></div>
          <div className="task-preview-list">{pending.length ? pending.slice(0, 4).map((task) => <TaskPreview key={task.id} task={task} />) : <EmptyState icon={<CheckCircle2 size={23} />} title="Nothing on the list" text="Add a task when something new comes up." />}</div>
        </section>
        <section className="focus-panel"><div className="focus-top"><span className="section-kicker">A MOMENT TO FOCUS</span><BookOpen size={20} /></div><div className="focus-number">{String(pending.length).padStart(2, '0')}</div><h2>open loops</h2><p>Choose one meaningful thing. Give it your full attention, then let the next one wait.</p><Link to="/tasks?status=Pending" className="focus-link">Find your focus <ArrowUpRight size={16} /></Link><div className="focus-decoration"><span></span><span></span><span></span></div></section>
      </div>
      <section className="content-section completed-section"><div className="section-heading"><div><span className="section-kicker">LOOK HOW FAR YOU’VE COME</span><h2>Recently finished</h2></div><Link className="text-link" to="/completed">See all <ArrowRight size={15} /></Link></div>{completed.length ? <div className="recent-completed">{completed.slice(0, 2).map((task) => <div className="completed-line" key={task.id}><span className="completed-check"><Check size={13} /></span><span>{task.title}</span><small>{formatDate(task.dueDate)}</small></div>)}</div> : <p className="quiet-empty">Completed tasks will show up here.</p>}</section>
    </div>
  )
}

function StatCard({ icon, label, value, note, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>
}

function TaskPreview({ task }) {
  return <Link to={`/tasks/${task.id}`} className="task-preview"><span className="preview-dot"></span><span className="preview-main"><strong>{task.title}</strong><small>{task.category} <span>·</span> <PriorityLabel priority={task.priority} /></small></span><span className={`preview-date${task.dueDate < dateOffset(0) && task.status !== 'Closed' ? ' overdue' : ''}`}>{formatDate(task.dueDate)}<ArrowRight size={14} /></span></Link>
}

function TasksPage({ tasks, onStatusChange, onDelete, completedOnly = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const statusFilter = searchParams.get('status') || (completedOnly ? 'Closed' : 'All')
  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter
    const matchesQuery = `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesQuery && (!completedOnly || task.status === 'Closed')
  }).sort((first, second) => first.dueDate.localeCompare(second.dueDate))

  function changeFilter(event) {
    const next = event.target.value
    setSearchParams(next === 'All' ? {} : { status: next }, { replace: true })
  }

  return (
    <div className="page-content">
      <PageHeader eyebrow={completedOnly ? 'YOUR ACCOMPLISHMENTS' : 'THE FULL PICTURE'} title={completedOnly ? 'Look at you go.' : 'All tasks'} description={completedOnly ? 'Every finished task is a small win worth keeping.' : 'Everything you’re carrying, gathered in one place.'} action={!completedOnly && <Link className="button button-primary" to="/tasks/new"><Plus size={17} /> New task</Link>} />
      <section className="list-toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search tasks" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div><label className="filter-select"><SlidersHorizontal size={16} /><select aria-label="Filter by status" value={statusFilter} onChange={changeFilter}><option>All</option><option>Raised</option><option>Pending</option><option>Closed</option></select><ChevronDown size={14} /></label><span className="result-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span></section>
      {visibleTasks.length ? <section className="task-table" aria-label="Tasks"><div className="task-table-head"><span>TASK</span><span>CATEGORY</span><span>PRIORITY</span><span>DUE DATE</span><span>STATUS</span><span></span></div>{visibleTasks.map((task) => <TaskRow key={task.id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} />)}</section> : <EmptyState icon={<Search size={23} />} title="No tasks found" text={search ? 'Try a different search or filter.' : 'Your list is clear. Add a task whenever you need to.'} action={!completedOnly && <Link className="button button-secondary" to="/tasks/new"><Plus size={16} /> Add a task</Link>} />}
    </div>
  )
}

function TaskRow({ task, onStatusChange, onDelete }) {
  return <article className="task-row"><Link className="task-title-cell" to={`/tasks/${task.id}`}><span className={`row-status-dot ${task.status.toLowerCase()}`}></span><span><strong>{task.title}</strong><small>{task.description}</small></span></Link><span className="table-category">{task.category}</span><span><PriorityLabel priority={task.priority} /></span><span className={`table-due${task.dueDate < dateOffset(0) && task.status !== 'Closed' ? ' overdue' : ''}`}>{formatDate(task.dueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span><StatusLabel status={task.status} /></span><span className="row-actions">{task.status !== 'Closed' && <button type="button" className="icon-button" onClick={() => onStatusChange(task.id, 'Closed')} title="Mark complete" aria-label={`Complete ${task.title}`}><Check size={16} /></button>}<button type="button" className="icon-button danger-icon" onClick={() => onDelete(task.id)} title="Delete task" aria-label={`Delete ${task.title}`}><Trash2 size={15} /></button></span></article>
}

function TaskDetailsPage({ tasks, onStatusChange, onDelete }) {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const task = tasks.find((item) => item.id === taskId)

  if (!task) return <div className="page-content"><EmptyState icon={<Circle size={23} />} title="Task not found" text="It may have been deleted or moved." action={<Link className="button button-secondary" to="/tasks">Back to tasks</Link>} /></div>

  function removeTask() {
    onDelete(task.id)
    navigate('/tasks')
  }

  return <div className="page-content detail-page"><Link className="back-link" to="/tasks"><ArrowDownRight size={15} /> Back to all tasks</Link><div className="detail-layout"><article className="detail-main"><div className="detail-tags"><StatusLabel status={task.status} /><PriorityLabel priority={task.priority} /><span className="category-tag">{task.category}</span></div><h1>{task.title}</h1><p className="detail-description">{task.description || 'No description added.'}</p><div className="detail-divider"></div><div className="detail-meta"><div><span className="meta-label"><Clock3 size={14} /> RAISED</span><strong>{formatRaisedAt(task.raisedAt)}</strong></div><div><span className="meta-label"><CalendarDays size={14} /> DUE DATE</span><strong>{formatDate(task.dueDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></div></div></article><aside className="detail-actions"><span className="section-kicker">TASK ACTIONS</span><Link className="button button-secondary full-button" to={`/tasks/${task.id}/edit`}>Edit task</Link>{task.status !== 'Closed' && <button className="button button-primary full-button" type="button" onClick={() => onStatusChange(task.id, 'Closed')}><Check size={16} /> Mark complete</button>}{task.status === 'Closed' && <button className="button button-secondary full-button" type="button" onClick={() => onStatusChange(task.id, 'Pending')}><X size={16} /> Reopen task</button>}<button className="delete-button" type="button" onClick={removeTask}><Trash2 size={15} /> Delete task</button></aside></div></div>
}

function TaskFormPage({ tasks = [], onSave }) {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const existingTask = tasks.find((task) => task.id === taskId)
  const [form, setForm] = useState(() => ({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    priority: existingTask?.priority || 'Medium',
    category: existingTask?.category || 'Academic',
    dueDate: existingTask?.dueDate || dateOffset(1),
    status: existingTask?.status || 'Raised',
  }))

  if (taskId && !existingTask) return <Navigate to="/tasks" replace />

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function submitTask(event) {
    event.preventDefault()
    onSave({
      ...existingTask,
      ...form,
      id: existingTask?.id || `task-${crypto.randomUUID()}`,
      raisedAt: existingTask?.raisedAt || new Date().toISOString(),
    })
    navigate(existingTask ? `/tasks/${existingTask.id}` : '/tasks')
  }

  return <div className="page-content form-page"><Link className="back-link" to={existingTask ? `/tasks/${existingTask.id}` : '/tasks'}><ArrowDownRight size={15} /> {existingTask ? 'Back to task' : 'Back to all tasks'}</Link><PageHeader eyebrow={existingTask ? 'MAKE IT YOURS' : 'A FRESH START'} title={existingTask ? 'Edit task' : 'Add a task'} description={existingTask ? 'A few details can make the next step clearer.' : 'Get it out of your head and into a plan.'} /><form className="task-form" onSubmit={submitTask}><div className="form-field"><label htmlFor="title">Task header <span>*</span></label><input id="title" name="title" value={form.title} onChange={updateField} placeholder="What needs to get done?" required maxLength={100} autoFocus /></div><div className="form-field"><label htmlFor="description">Description</label><textarea id="description" name="description" value={form.description} onChange={updateField} placeholder="Add a little context or a first step..." rows={4} maxLength={500} /></div><div className="form-two-col"><div className="form-field"><label htmlFor="priority">Priority</label><select id="priority" name="priority" value={form.priority} onChange={updateField}><option>High</option><option>Medium</option><option>Low</option></select></div><div className="form-field"><label htmlFor="category">Category</label><select id="category" name="category" value={form.category} onChange={updateField}><option>Academic</option><option>Personal</option></select></div></div><div className="form-two-col"><div className="form-field"><label htmlFor="dueDate">Due date</label><input id="dueDate" type="date" name="dueDate" value={form.dueDate} onChange={updateField} required /></div>{existingTask && <div className="form-field"><label htmlFor="status">Status</label><select id="status" name="status" value={form.status} onChange={updateField}><option>Raised</option><option>Pending</option><option>Closed</option></select></div>}</div><div className="raised-note"><Clock3 size={15} /><span>Raised date and time are set automatically when you save.</span></div><div className="form-actions"><Link className="button button-quiet" to={existingTask ? `/tasks/${existingTask.id}` : '/tasks'}>Cancel</Link><button type="submit" className="button button-primary"><Check size={16} /> {existingTask ? 'Save changes' : 'Create task'}</button></div></form></div>
}

function PriorityLabel({ priority }) {
  return <span className={`priority-label ${priority.toLowerCase()}`}><span></span>{priority}</span>
}

function StatusLabel({ status }) {
  return <span className={`status-label ${status.toLowerCase()}`}>{status}</span>
}

function EmptyState({ icon, title, text, action }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{text}</p>{action}</div>
}

export default App
