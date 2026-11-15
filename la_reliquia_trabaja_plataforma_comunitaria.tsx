import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type Dispatch,
  type FormEvent,
  type SetStateAction
} from 'react';
import {
  Search,
  Briefcase,
  Users,
  MapPin,
  Phone,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Edit3,
  AlertTriangle,
  Flag,
  Lock,
  Eye,
  EyeOff,
  X,
  Menu,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Building2,
  FileText,
  Terminal,
  Copy,
  Check,
  Home,
  UserCheck,
  LogOut,
  KeyRound,
  Award,
  ExternalLink,
  RefreshCw,
  Scale,
  Database,
  FolderGit2,
  Loader2,
  Info
} from 'lucide-react';
import {
  createApplication,
  createJob,
  createPortfolioItem,
  createProfile,
  createReport,
  deleteJob,
  deletePortfolioItem,
  deleteProfile,
  describeError,
  fetchIsAdmin,
  insertAdminLog,
  loadAllData,
  loadDemoData,
  removeDemoData,
  sendPasswordReset,
  setJobStatus,
  setNewPassword,
  setPortfolioStatus,
  setProfileStatus,
  setProfileVerified,
  setReportStatus,
  signInAccount,
  signOutAccount,
  signUpAccount,
  toSessionUser,
  updateJob,
  updatePortfolioItem,
  updateProfile,
  type ProcessedImage
} from './lib/api';
import {
  AVAILABILITY_OPTIONS,
  CATEGORIES,
  JOB_MODALITIES,
  JOB_TYPES,
  SECTORS
} from './lib/catalogs';
import { INITIAL_JOBS, INITIAL_PORTFOLIO, INITIAL_PROFILES } from './lib/seed';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import type {
  AdminLog,
  ApplicationInput,
  CategoryInfo,
  JobApplication,
  JobInput,
  JobPosting,
  PortfolioInput,
  PortfolioItem,
  Profile,
  ProfileInput,
  ProfileStatus,
  Report,
  ReportInput,
  ReportStatus,
  ReportTarget,
  SessionUser,
  TabId,
  ToastState,
  ToastType
} from './lib/types';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_INPUT_IMAGE_MB,
  addDaysISO,
  compressImage,
  formatDate,
  isJobOpen,
  isValidColombianMobile,
  isValidEmail,
  normalizePhone,
  todayISO
} from './lib/utils';

// ============================================================================
// TIPOS AUXILIARES DE LA INTERFAZ
// ============================================================================
type ShowToast = (message: string, type?: ToastType) => void;
type AuthMode = 'login' | 'register' | 'recover' | 'reset';

interface NavItem {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

const VALID_TABS: TabId[] = ['inicio', 'directorio', 'empleos', 'mi_panel', 'admin', 'arquitectura'];

function readTabFromHash(): TabId {
  if (typeof window === 'undefined') return 'inicio';
  const raw = window.location.hash.replace(/^#\/?/, '');
  return (VALID_TABS as string[]).includes(raw) ? (raw as TabId) : 'inicio';
}

const FALLBACK_CATEGORY: CategoryInfo = {
  id: CATEGORIES[0].id,
  name: CATEGORIES[0].name,
  description: CATEGORIES[0].description,
  color: CATEGORIES[0].color
};

/** Cierra una ventana flotante al presionar la tecla Escape. */
function useEscapeKey(onClose: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
}

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÃ“N
// ============================================================================
export default function App() {
  // --- SesiÃ³n real (Supabase Auth) y rol de administrador (public.user_roles) ---
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(!isSupabaseConfigured);

  // --- NavegaciÃ³n ---
  const [activeTab, setActiveTabState] = useState<TabId>(readTabFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // --- Datos sincronizados con Supabase (sin configuraciÃ³n: demostraciÃ³n de solo lectura) ---
  const [profiles, setProfiles] = useState<Profile[]>(isSupabaseConfigured ? [] : INITIAL_PROFILES);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(
    isSupabaseConfigured ? [] : INITIAL_PORTFOLIO
  );
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(isSupabaseConfigured ? [] : INITIAL_JOBS);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(isSupabaseConfigured);
  const [dataError, setDataError] = useState<string | null>(null);
  const loadRequestRef = useRef(0);

  // --- Filtros de bÃºsqueda (Directorio y Bolsa de Empleo) ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [dirSearch, setDirSearch] = useState('');
  const [dirCategory, setDirCategory] = useState('todas');
  const [dirSector, setDirSector] = useState('todos');
  const [dirAvailability, setDirAvailability] = useState('todas');
  const [dirOnlyWithPhotos, setDirOnlyWithPhotos] = useState(false);

  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState('todas');
  const [jobTypeFilter, setJobTypeFilter] = useState('todos');
  const [jobModalityFilter, setJobModalityFilter] = useState('todas');
  const [jobShowClosed, setJobShowClosed] = useState(false);

  // --- Ventanas flotantes ---
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<PortfolioItem | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [authModalHint, setAuthModalHint] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [whatsappPreview, setWhatsappPreview] = useState<Profile | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);

  // --- Avisos flotantes ---
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback<ShowToast>((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), type === 'error' ? 8000 : 4200);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /** Ejecuta una operaciÃ³n asÃ­ncrona; si falla muestra un aviso ROJO y devuelve undefined. */
  const runOp = useCallback(
    async <T,>(operation: () => Promise<T>, fallbackMessage: string): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (err) {
        console.error('[La Reliquia Trabaja]', err);
        showToast(describeError(err, fallbackMessage), 'error');
        return undefined;
      }
    },
    [showToast]
  );

  // ==========================================================================
  // NAVEGACIÃ“N (con hash en la URL para que F5 conserve la secciÃ³n)
  // ==========================================================================
  const navigate = useCallback((tab: TabId, options?: { replace?: boolean }) => {
    setActiveTabState(tab);
    setMobileMenuOpen(false);
    const nextHash = `#${tab}`;
    if (window.location.hash !== nextHash) {
      if (options?.replace) window.history.replaceState(null, '', nextHash);
      else window.history.pushState(null, '', nextHash);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTabState(readTabFromHash());
    window.addEventListener('popstate', onHashChange);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onHashChange);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileMenuOpen]);

  const openAuth = useCallback((mode: AuthMode = 'login', hint?: string) => {
    setAuthModalMode(mode);
    setAuthModalHint(hint);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  }, []);

  // ==========================================================================
  // AUTENTICACIÃ“N REAL
  // ==========================================================================
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const applySession = async (userFromSession: SessionUser | null) => {
      if (!userFromSession) {
        setSessionUser(null);
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }
      setSessionUser((prev) =>
        prev &&
        prev.id === userFromSession.id &&
        prev.email === userFromSession.email &&
        prev.displayName === userFromSession.displayName
          ? prev
          : userFromSession
      );
      const admin = await fetchIsAdmin(userFromSession.id);
      if (!cancelled) {
        setIsAdmin(admin);
        setAuthReady(true);
      }
    };

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session ? toSessionUser(data.session.user) : null))
      .catch((err) => {
        console.error('[La Reliquia Trabaja] No se pudo recuperar la sesiÃ³n:', err);
        if (!cancelled) setAuthReady(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('reset');
        setAuthModalHint(undefined);
        setAuthModalOpen(true);
      }
      // No se llama a Supabase directamente dentro del callback (evita bloqueos internos del cliente).
      window.setTimeout(() => {
        if (!cancelled) void applySession(session ? toSessionUser(session.user) : null);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // ==========================================================================
  // CARGA DE DATOS DESDE SUPABASE
  // ==========================================================================
  const currentUserId = sessionUser?.id ?? null;

  const reloadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const requestId = ++loadRequestRef.current;
    setDataLoading(true);
    try {
      const data = await loadAllData({ userId: currentUserId, isAdmin });
      if (requestId !== loadRequestRef.current) return;
      setProfiles(data.profiles);
      setPortfolioItems(data.portfolio);
      setJobPostings(data.jobs);
      setJobApplications(data.applications);
      setReports(data.reports);
      setAdminLogs(data.adminLogs);
      setDataError(null);
    } catch (err) {
      if (requestId !== loadRequestRef.current) return;
      console.error('[La Reliquia Trabaja] Error cargando datos:', err);
      setDataError(describeError(err, 'No se pudo cargar la informaciÃ³n de la comunidad.'));
    } finally {
      if (requestId === loadRequestRef.current) setDataLoading(false);
    }
  }, [currentUserId, isAdmin]);

  useEffect(() => {
    if (authReady) void reloadData();
  }, [authReady, reloadData]);

  // ProtecciÃ³n de secciones privadas (tambiÃ©n las valida el servidor con RLS)
  useEffect(() => {
    if (!authReady) return;
    if (activeTab === 'mi_panel' && !sessionUser) {
      navigate('inicio', { replace: true });
      openAuth('login');
    } else if ((activeTab === 'admin' || activeTab === 'arquitectura') && !isAdmin) {
      navigate('inicio', { replace: true });
      if (!sessionUser) openAuth('login', 'Acceso reservado a la Junta de AcciÃ³n Comunal.');
    }
  }, [authReady, activeTab, sessionUser, isAdmin, navigate, openAuth]);

  const handleSignOut = useCallback(async () => {
    const ok = await runOp(async () => {
      await signOutAccount();
      return true;
    }, 'No se pudo cerrar la sesiÃ³n.');
    if (ok) {
      navigate('inicio');
      showToast('SesiÃ³n cerrada correctamente');
    }
  }, [navigate, runOp, showToast]);

  // ==========================================================================
  // DATOS DERIVADOS Y FILTROS
  // ==========================================================================
  const myProfiles = useMemo(
    () =>
      sessionUser
        ? profiles
            .filter((p) => p.ownerId === sessionUser.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [profiles, sessionUser]
  );

  const myPortfolio = useMemo(() => {
    const ids = new Set(myProfiles.map((p) => p.id));
    return portfolioItems
      .filter((item) => ids.has(item.profileId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [portfolioItems, myProfiles]);

  const approvedProfiles = useMemo(() => profiles.filter((p) => p.status === 'approved'), [profiles]);

  const publicPortfolio = useMemo(
    () => portfolioItems.filter((item) => item.status !== 'flagged'),
    [portfolioItems]
  );

  const filteredProfiles = useMemo(() => {
    const q = dirSearch.trim().toLowerCase();
    return approvedProfiles.filter((worker) => {
      const matchesQuery =
        !q ||
        worker.name.toLowerCase().includes(q) ||
        worker.profession.toLowerCase().includes(q) ||
        worker.bio.toLowerCase().includes(q) ||
        worker.skills.some((s) => s.toLowerCase().includes(q));
      const matchesCategory = dirCategory === 'todas' || worker.category === dirCategory;
      const matchesSector = dirSector === 'todos' || worker.sector === dirSector;
      const matchesAvailability = dirAvailability === 'todas' || worker.availability === dirAvailability;
      const matchesPhotos =
        !dirOnlyWithPhotos || publicPortfolio.some((item) => item.profileId === worker.id);
      return matchesQuery && matchesCategory && matchesSector && matchesAvailability && matchesPhotos;
    });
  }, [approvedProfiles, dirSearch, dirCategory, dirSector, dirAvailability, dirOnlyWithPhotos, publicPortfolio]);

  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();
    return jobPostings
      .filter((job) => {
        const matchesQuery =
          !q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q);
        const matchesCategory = jobCategory === 'todas' || job.category === jobCategory;
        const matchesType = jobTypeFilter === 'todos' || job.jobType === jobTypeFilter;
        const matchesModality = jobModalityFilter === 'todas' || job.modality === jobModalityFilter;
        const matchesStatus = jobShowClosed ? true : isJobOpen(job);
        return matchesQuery && matchesCategory && matchesType && matchesModality && matchesStatus;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [jobPostings, jobSearch, jobCategory, jobTypeFilter, jobModalityFilter, jobShowClosed]);

  const openJobsCount = useMemo(() => jobPostings.filter(isJobOpen).length, [jobPostings]);

  const categoryStats = useMemo(() => {
    const map: Record<string, { workers: number; jobs: number }> = {};
    CATEGORIES.forEach((cat) => {
      map[cat.id] = {
        workers: approvedProfiles.filter((p) => p.category === cat.id).length,
        jobs: jobPostings.filter((j) => j.category === cat.id && isJobOpen(j)).length
      };
    });
    return map;
  }, [approvedProfiles, jobPostings]);

  const selectedWorker = useMemo(
    () => profiles.find((p) => p.id === selectedWorkerId) ?? null,
    [profiles, selectedWorkerId]
  );
  const selectedJob = useMemo(
    () => jobPostings.find((j) => j.id === selectedJobId) ?? null,
    [jobPostings, selectedJobId]
  );

  const getCategoryInfo = useCallback((catId: string): CategoryInfo => {
    const found = CATEGORIES.find((c) => c.id === catId);
    return found
      ? { id: found.id, name: found.name, description: found.description, color: found.color }
      : FALLBACK_CATEGORY;
  }, []);

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = globalSearch.trim();
    setDirSearch(term);
    setJobSearch(term);
    navigate('directorio');
  };

  const handleSelectCategory = (categoryId: string) => {
    setDirCategory(categoryId);
    navigate('directorio');
  };

  /** Si no hay sesiÃ³n abre el inicio de sesiÃ³n y devuelve false. */
  const requireLogin = useCallback(
    (mode: AuthMode = 'login', hint?: string): boolean => {
      if (sessionUser) return true;
      openAuth(mode, hint ?? 'Inicia sesiÃ³n para continuar.');
      return false;
    },
    [openAuth, sessionUser]
  );

  const openNewJob = () => {
    if (!requireLogin('login', 'Inicia sesiÃ³n para publicar una vacante.')) return;
    setEditingJob(null);
    setIsJobFormOpen(true);
  };

  const openRegisterOrPanel = () => {
    if (!sessionUser) openAuth('register');
    else navigate('mi_panel');
  };

  // ==========================================================================
  // OPERACIONES DE ESCRITURA (confirmadas por Supabase antes de mostrar Ã©xito)
  // ==========================================================================
  const guardWritable = (): boolean => {
    if (!isSupabaseConfigured) {
      showToast(
        'Modo demostraciÃ³n: la plataforma no estÃ¡ conectada a Supabase, por eso no se puede guardar informaciÃ³n.',
        'error'
      );
      return false;
    }
    return true;
  };

  const handleCreateProfile = async (input: ProfileInput): Promise<Profile | null> => {
    if (!guardWritable() || !sessionUser) return null;
    const created = await runOp(() => createProfile(sessionUser.id, input), 'No se pudo crear el perfil.');
    if (!created) return null;
    setProfiles((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  };

  const handleUpdateProfile = async (id: string, input: ProfileInput): Promise<Profile | null> => {
    if (!guardWritable()) return null;
    const updated = await runOp(() => updateProfile(id, input), 'No se pudo guardar el perfil.');
    if (!updated) return null;
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  };

  const handleSavePortfolioItem = async (
    profile: Profile,
    input: PortfolioInput,
    image: ProcessedImage | null,
    editingItem: PortfolioItem | null
  ): Promise<boolean> => {
    if (!guardWritable() || !sessionUser) return false;
    if (editingItem) {
      const updated = await runOp(
        () => updatePortfolioItem(sessionUser.id, editingItem, input, image),
        'No se pudo actualizar la fotografÃ­a.'
      );
      if (!updated) return false;
      setPortfolioItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      return true;
    }
    if (!image) {
      showToast('Selecciona una fotografÃ­a antes de subirla.', 'error');
      return false;
    }
    const created = await runOp(
      () => createPortfolioItem(sessionUser.id, profile, input, image),
      'No se pudo subir la fotografÃ­a.'
    );
    if (!created) return false;
    setPortfolioItems((prev) => [created, ...prev]);
    return true;
  };

  const handleDeletePortfolioItem = async (item: PortfolioItem): Promise<boolean> => {
    if (!guardWritable()) return false;
    const ok = await runOp(async () => {
      await deletePortfolioItem(item);
      return true;
    }, 'No se pudo eliminar la fotografÃ­a.');
    if (!ok) return false;
    setPortfolioItems((prev) => prev.filter((i) => i.id !== item.id));
    return true;
  };

  const confirmDeleteProfile = async () => {
    if (!deleteTarget || !guardWritable()) return;
    setDeleting(true);
    const target = deleteTarget;
    const ok = await runOp(async () => {
      await deleteProfile(target, portfolioItems);
      return true;
    }, 'No se pudo eliminar el perfil.');
    setDeleting(false);
    if (!ok) return;
    setProfiles((prev) => prev.filter((p) => p.id !== target.id));
    setPortfolioItems((prev) => prev.filter((i) => i.profileId !== target.id));
    setDeleteTarget(null);
    setSelectedWorkerId((current) => (current === target.id ? null : current));
    showToast(`El perfil Â«${target.name}Â» y sus fotografÃ­as fueron eliminados permanentemente.`);
    if (isAdmin && target.ownerId !== sessionUser?.id) {
      void recordAdminLog('ELIMINACIÃ“N DE PERFIL', 'profile', target.name, 'Perfil eliminado por moderaciÃ³n');
    }
  };

  const handleSaveJob = async (editingId: string | null, input: JobInput): Promise<boolean> => {
    if (!guardWritable() || !sessionUser) return false;
    if (editingId) {
      const updated = await runOp(() => updateJob(editingId, input), 'No se pudo actualizar la vacante.');
      if (!updated) return false;
      setJobPostings((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      return true;
    }
    const created = await runOp(() => createJob(sessionUser.id, input), 'No se pudo publicar la vacante.');
    if (!created) return false;
    setJobPostings((prev) => [created, ...prev]);
    return true;
  };

  const handleDeleteJobByOwner = async (job: JobPosting): Promise<boolean> => {
    if (!guardWritable()) return false;
    const ok = await runOp(async () => {
      await deleteJob(job.id);
      return true;
    }, 'No se pudo eliminar la vacante.');
    if (!ok) return false;
    setJobPostings((prev) => prev.filter((j) => j.id !== job.id));
    setJobApplications((prev) => prev.filter((a) => a.jobId !== job.id));
    if (isAdmin && job.authorId !== sessionUser?.id) {
      void recordAdminLog('ELIMINACIÃ“N DE VACANTE', 'job', job.title, `Vacante de ${job.company} eliminada`);
    }
    return true;
  };

  const handleApplyJob = async (input: ApplicationInput): Promise<boolean> => {
    if (!guardWritable() || !sessionUser) return false;
    const created = await runOp(() => createApplication(sessionUser.id, input), 'No se pudo enviar la postulaciÃ³n.');
    if (!created) return false;
    setJobApplications((prev) => [created, ...prev]);
    return true;
  };

  const handleSubmitReport = async (input: ReportInput): Promise<boolean> => {
    if (!guardWritable()) return false;
    const created = await runOp(() => createReport(sessionUser?.id ?? null, input), 'No se pudo enviar el reporte.');
    if (!created) return false;
    if (isAdmin) setReports((prev) => [created, ...prev]);
    return true;
  };

  // ---- AdministraciÃ³n (el servidor rechaza cualquier acciÃ³n si no hay rol admin) ----
  const recordAdminLog = async (action: string, targetType: string, targetName: string, details: string) => {
    if (!sessionUser) return;
    const entry = await runOp(
      () => insertAdminLog(sessionUser, action, targetType, targetName, details),
      'La acciÃ³n se aplicÃ³, pero no se pudo registrar en la auditorÃ­a.'
    );
    if (entry) setAdminLogs((prev) => [entry, ...prev]);
  };

  const adminAction = async (
    operation: () => Promise<void>,
    apply: () => void,
    log: { action: string; targetType: string; targetName: string; details: string },
    successMessage: string
  ) => {
    if (!isAdmin) {
      showToast('Solo la Junta administradora puede realizar esta acciÃ³n.', 'error');
      return;
    }
    const ok = await runOp(async () => {
      await operation();
      return true;
    }, 'No se pudo completar la acciÃ³n administrativa.');
    if (!ok) return;
    apply();
    showToast(successMessage);
    await recordAdminLog(log.action, log.targetType, log.targetName, log.details);
  };

  const handleUpdateProfileStatus = (p: Profile, status: ProfileStatus) =>
    adminAction(
      () => setProfileStatus(p.id, status),
      () => setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x))),
      {
        action:
          status === 'approved' ? 'APROBACIÃ“N DE PERFIL' : status === 'suspended' ? 'SUSPENSIÃ“N DE PERFIL' : 'PERFIL EN REVISIÃ“N',
        targetType: 'profile',
        targetName: p.name,
        details: `Cambio de estado a ${status}`
      },
      `Estado del perfil de ${p.name} actualizado.`
    );

  const handleToggleProfileVerify = (p: Profile) =>
    adminAction(
      () => setProfileVerified(p.id, !p.verified),
      () => setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, verified: !p.verified } : x))),
      {
        action: 'INSIGNIA VERIFICACIÃ“N',
        targetType: 'profile',
        targetName: p.name,
        details: `VerificaciÃ³n cambiada a ${!p.verified}`
      },
      `VerificaciÃ³n de ${p.name} actualizada.`
    );

  const handleSetPortfolioStatus = (item: PortfolioItem, status: 'approved' | 'flagged') =>
    adminAction(
      () => setPortfolioStatus(item.id, status),
      () => setPortfolioItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status } : x))),
      {
        action: status === 'flagged' ? 'FOTO OCULTADA' : 'FOTO RESTAURADA',
        targetType: 'portfolio',
        targetName: item.title,
        details: `Foto de ${item.workerName} ${status === 'flagged' ? 'ocultada' : 'restaurada'} por moderaciÃ³n`
      },
      status === 'flagged' ? 'FotografÃ­a ocultada al pÃºblico.' : 'FotografÃ­a restaurada.'
    );

  const handleAdminDeletePortfolio = (item: PortfolioItem) =>
    adminAction(
      () => deletePortfolioItem(item),
      () => setPortfolioItems((prev) => prev.filter((x) => x.id !== item.id)),
      {
        action: 'MODERACIÃ“N FOTO',
        targetType: 'portfolio',
        targetName: item.title,
        details: `Eliminada foto de ${item.workerName}`
      },
      'FotografÃ­a retirada por moderaciÃ³n.'
    );

  const handleToggleJobStatus = (job: JobPosting) => {
    const next = job.status === 'abierta' ? 'cerrada' : 'abierta';
    return adminAction(
      () => setJobStatus(job.id, next),
      () => setJobPostings((prev) => prev.map((x) => (x.id === job.id ? { ...x, status: next } : x))),
      {
        action: 'ESTADO DE VACANTE',
        targetType: 'job',
        targetName: job.title,
        details: `Vacante cambiada a ${next}`
      },
      `Vacante marcada como ${next}.`
    );
  };

  const handleSetReportStatus = (report: Report, status: ReportStatus) =>
    adminAction(
      () => setReportStatus(report.id, status),
      () => setReports((prev) => prev.map((x) => (x.id === report.id ? { ...x, status } : x))),
      {
        action: status === 'resuelto' ? 'RESOLUCIÃ“N DE REPORTE' : 'REPORTE DESCARTADO',
        targetType: report.targetType,
        targetName: report.targetTitle,
        details: `Reporte marcado como ${status}`
      },
      `Reporte marcado como ${status}.`
    );

  const handleLoadDemo = async () => {
    await adminAction(
      loadDemoData,
      () => undefined,
      {
        action: 'CARGA DE DEMOSTRACIÃ“N',
        targetType: 'sistema',
        targetName: 'Datos de demostraciÃ³n',
        details: 'Se cargaron perfiles, fotos y vacantes ficticias de ejemplo.'
      },
      'Datos de demostraciÃ³n cargados.'
    );
    await reloadData();
  };

  const handleRemoveDemo = async () => {
    if (!window.confirm('Â¿Quitar todos los perfiles, fotos y vacantes de DEMOSTRACIÃ“N? Los datos reales no se tocan.')) return;
    await adminAction(
      removeDemoData,
      () => undefined,
      {
        action: 'RETIRO DE DEMOSTRACIÃ“N',
        targetType: 'sistema',
        targetName: 'Datos de demostraciÃ³n',
        details: 'Se eliminaron los perfiles, fotos y vacantes ficticias.'
      },
      'Datos de demostraciÃ³n eliminados.'
    );
    await reloadData();
  };

  // ==========================================================================
  // NAVEGACIÃ“N PRINCIPAL
  // ==========================================================================
  const pendingProfilesCount = profiles.filter((p) => p.status === 'pending').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pendiente').length;

  const navItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'directorio', label: 'Directorio de Talento', icon: Users, badge: approvedProfiles.length },
    { id: 'empleos', label: 'Bolsa de Empleo', icon: Briefcase, badge: openJobsCount },
    ...(sessionUser ? [{ id: 'mi_panel' as TabId, label: 'Mi Panel', icon: UserCheck }] : []),
    ...(isAdmin
      ? [
          {
            id: 'admin' as TabId,
            label: 'AdministraciÃ³n',
            icon: ShieldCheck,
            badge: pendingProfilesCount + pendingReportsCount
          },
          { id: 'arquitectura' as TabId, label: 'Base de Datos', icon: Database }
        ]
      : [])
  ];

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* BANNER SUPERIOR INSTITUCIONAL */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
              COMUNIDAD ACTIVA
            </span>
            <span className="font-medium">Barrio La Reliquia â€¢ Villavicencio, Meta, Colombia</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isSupabaseConfigured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Modo demostraciÃ³n (sin base de datos)
              </span>
            )}
            {isAdmin ? (
              <button
                type="button"
                onClick={() => navigate('admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm transition-all"
                title="Ir al panel de moderaciÃ³n de la Junta"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Junta: Panel de AdministraciÃ³n
              </button>
            ) : (
              !sessionUser && (
                <button
                  type="button"
                  onClick={() => openAuth('login', 'Acceso reservado a la Junta de AcciÃ³n Comunal. Inicia sesiÃ³n con tu cuenta autorizada.')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
                  title="Acceso para la Junta directiva"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Acceso Junta
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGACIÃ“N PRINCIPAL */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              type="button"
              onClick={() => navigate('inicio')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                LR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    La Reliquia <span className="text-blue-500">Trabaja</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Talento local, oportunidades para todos</p>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-1.5" aria-label="NavegaciÃ³n principal">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
                          active ? 'bg-blue-800 text-white' : 'bg-slate-700 text-blue-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden sm:flex items-center gap-2.5">
              <button
                type="button"
                onClick={openNewJob}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Vacante</span>
              </button>

              {sessionUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('mi_panel')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {(sessionUser.displayName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{sessionUser.displayName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition-all"
                    title="Cerrar SesiÃ³n"
                    aria-label="Cerrar sesiÃ³n"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="px-3 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    Iniciar SesiÃ³n
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Registrarse
                  </button>
                </>
              )}
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 focus:outline-none"
                aria-label={mobileMenuOpen ? 'Cerrar menÃº' : 'Abrir menÃº'}
                aria-expanded={mobileMenuOpen}
                aria-controls="menu-movil"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="menu-movil"
            className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-5 space-y-2 max-h-[80vh] overflow-y-auto"
          >
            {sessionUser && (
              <p className="px-1 pb-1 text-xs text-slate-400">
                SesiÃ³n: <strong className="text-slate-200">{sessionUser.displayName}</strong>
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                    activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] rounded-full font-bold bg-slate-700 text-blue-300">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openNewJob();
                }}
                className={`py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 ${
                  sessionUser ? 'col-span-1' : 'col-span-2'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Publicar Vacante
              </button>
              {sessionUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar SesiÃ³n
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    Iniciar SesiÃ³n
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    Registrarse
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('login', 'Acceso reservado a la Junta de AcciÃ³n Comunal. Inicia sesiÃ³n con tu cuenta autorizada.')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Acceso Junta
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ESTADO DE CARGA / ERROR DE DATOS */}
      {dataError && (
        <div role="alert" className="bg-red-50 border-b border-red-200 text-red-900 px-4 py-3 text-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-start gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{dataError}</span>
            </p>
            <button
              type="button"
              onClick={() => void reloadData()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        </div>
      )}
      {dataLoading && !dataError && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-900 px-4 py-2 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando informaciÃ³n de la comunidadâ€¦
          </div>
        </div>
      )}

      {/* NOTIFICACIÃ“N TOAST FLOTANTE */}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`toast-enter fixed bottom-5 right-5 left-5 sm:left-auto z-[60] max-w-md bg-slate-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border-2 flex items-start gap-3 ${
            toast.type === 'error' ? 'border-red-600' : 'border-blue-600'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DINÃMICO SEGÃšN PESTAÃ‘A */}
      <main className="flex-1">
        {activeTab === 'inicio' && (
          <HomeView
            approvedProfiles={approvedProfiles}
            portfolioItems={publicPortfolio}
            jobPostings={jobPostings}
            categoryStats={categoryStats}
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onHeroSearch={handleHeroSearch}
            onSelectCategory={handleSelectCategory}
            onNavigate={navigate}
            onOpenWorker={(w) => setSelectedWorkerId(w.id)}
            onOpenJob={(j) => setSelectedJobId(j.id)}
            onOpenNewJob={openNewJob}
            onOpenRegister={openRegisterOrPanel}
            onOpenPolicy={() => setPolicyOpen(true)}
            getCategoryInfo={getCategoryInfo}
          />
        )}

        {activeTab === 'directorio' && (
          <DirectoryView
            filteredProfiles={filteredProfiles}
            portfolioItems={publicPortfolio}
            dirSearch={dirSearch}
            setDirSearch={setDirSearch}
            dirCategory={dirCategory}
            setDirCategory={setDirCategory}
            dirSector={dirSector}
            setDirSector={setDirSector}
            dirAvailability={dirAvailability}
            setDirAvailability={setDirAvailability}
            dirOnlyWithPhotos={dirOnlyWithPhotos}
            setDirOnlyWithPhotos={setDirOnlyWithPhotos}
            onOpenWorker={(w) => setSelectedWorkerId(w.id)}
            onContactWhatsapp={(w) => setWhatsappPreview(w)}
            onNavigate={openRegisterOrPanel}
            getCategoryInfo={getCategoryInfo}
          />
        )}

        {activeTab === 'empleos' && (
          <JobsBoardView
            filteredJobs={filteredJobs}
            jobSearch={jobSearch}
            setJobSearch={setJobSearch}
            jobCategory={jobCategory}
            setJobCategory={setJobCategory}
            jobTypeFilter={jobTypeFilter}
            setJobTypeFilter={setJobTypeFilter}
            jobModalityFilter={jobModalityFilter}
            setJobModalityFilter={setJobModalityFilter}
            jobShowClosed={jobShowClosed}
            setJobShowClosed={setJobShowClosed}
            onOpenJob={(j) => setSelectedJobId(j.id)}
            onOpenNewJob={openNewJob}
            onEditJob={(j) => {
              setEditingJob(j);
              setIsJobFormOpen(true);
            }}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            getCategoryInfo={getCategoryInfo}
          />
        )}

        {activeTab === 'mi_panel' && sessionUser && (
          <MyDashboardView
            user={sessionUser}
            myProfiles={myProfiles}
            myPortfolio={myPortfolio}
            dataLoading={dataLoading}
            showToast={showToast}
            onOpenLightbox={(img) => setLightboxImage(img)}
            onOpenWorkerPreview={(w) => setSelectedWorkerId(w.id)}
            onOpenPolicy={() => setPolicyOpen(true)}
            onCreateProfile={handleCreateProfile}
            onUpdateProfile={handleUpdateProfile}
            onRequestDeleteProfile={(p) => setDeleteTarget(p)}
            onSavePortfolioItem={handleSavePortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            isAdmin={isAdmin}
            isLoggedIn={Boolean(sessionUser)}
            profiles={profiles}
            portfolioItems={portfolioItems}
            jobPostings={jobPostings}
            reports={reports}
            adminLogs={adminLogs}
            onOpenLogin={() => openAuth('login', 'Acceso reservado a la Junta de AcciÃ³n Comunal.')}
            onOpenWorker={(w) => setSelectedWorkerId(w.id)}
            onOpenJob={(j) => setSelectedJobId(j.id)}
            onLoadDemo={handleLoadDemo}
            onRemoveDemo={handleRemoveDemo}
            onUpdateProfileStatus={handleUpdateProfileStatus}
            onToggleProfileVerify={handleToggleProfileVerify}
            onDeleteProfile={(p) => setDeleteTarget(p)}
            onSetPortfolioStatus={handleSetPortfolioStatus}
            onDeletePortfolio={handleAdminDeletePortfolio}
            onToggleJobStatus={handleToggleJobStatus}
            onDeleteJob={async (job) => {
              if (!window.confirm(`Â¿Eliminar definitivamente la vacante Â«${job.title}Â»?`)) return;
              const ok = await handleDeleteJobByOwner(job);
              if (ok) showToast('Vacante eliminada.');
            }}
            onSetReportStatus={handleSetReportStatus}
          />
        )}

        {activeTab === 'arquitectura' && isAdmin && <TechnicalArchitectureView showToast={showToast} />}
      </main>

      {/* PIE DE PÃGINA INSTITUCIONAL Y CUMPLIMIENTO REGULATORIO COLOMBIANO */}
      <footer className="bg-slate-950 text-slate-200 border-t-4 border-blue-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                  LR
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">La Reliquia Trabaja</h3>
                  <p className="text-xs text-blue-400 font-semibold">Talento local, oportunidades para todos</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Plataforma comunitaria de directorio de oficios, emprendimientos y bolsa de empleo local para los
                habitantes del barrio La Reliquia, Villavicencio, Meta, Colombia. Impulsando la economÃ­a popular y el
                trabajo digno entre vecinos.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  ðŸ“ Comuna 4 â€¢ Villavicencio, Meta
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  ðŸ”’ ProtecciÃ³n Ley 1581 de 2012
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">NavegaciÃ³n RÃ¡pida</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button type="button" onClick={() => navigate('inicio')} className="hover:text-blue-300 transition-colors">
                    PÃ¡gina Principal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('directorio')} className="hover:text-blue-300 transition-colors">
                    Directorio de Trabajadores
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('empleos')} className="hover:text-blue-300 transition-colors">
                    Bolsa de Empleo Comunitaria
                  </button>
                </li>
                <li>
                  <button type="button" onClick={openRegisterOrPanel} className="hover:text-blue-300 transition-colors">
                    Publicar mi Oficio / Portafolio
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button type="button" onClick={() => navigate('arquitectura')} className="hover:text-blue-300 transition-colors">
                      DocumentaciÃ³n TÃ©cnica (Junta)
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">Marco Legal Colombia</h4>
              <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-white">Habeas Data (Ley 1581 de 2012):</strong> Todo habitante controla la
                  publicaciÃ³n de su perfil, fotografÃ­as y nÃºmero de WhatsApp, con derecho permanente a actualizar o
                  suprimir su cuenta.
                </p>
                <p>
                  <strong className="text-white">Aviso Regulatorio (Ley 1636 de 2013):</strong> Esta plataforma opera
                  como un directorio comunitario gratuito de contacto vecinal directo y cartelera informativa; no
                  realiza cobros ni intermediaciÃ³n laboral comercial sin autorizaciÃ³n del Ministerio del Trabajo / SPE.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>Â© {new Date().getFullYear()} Proyecto Comunitario La Reliquia Trabaja â€” Villavicencio, Meta, Colombia.</p>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setPolicyOpen(true)} className="underline hover:text-blue-400">
                PolÃ­tica de Tratamiento de Datos
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* MODALES FLOTANTES DE LA PLATAFORMA                                   */}
      {/* ==================================================================== */}

      {selectedWorker && (
        <WorkerProfileModal
          worker={selectedWorker}
          portfolio={portfolioItems.filter(
            (p) => p.profileId === selectedWorker.id && (p.status !== 'flagged' || isAdmin)
          )}
          categoryInfo={getCategoryInfo(selectedWorker.category)}
          onClose={() => setSelectedWorkerId(null)}
          onOpenLightbox={(item) => setLightboxImage(item)}
          onContactWhatsapp={(w) => setWhatsappPreview(w)}
          onReport={(target) =>
            setReportTarget({
              targetType: 'profile',
              targetId: target.id,
              targetTitle: `Perfil: ${target.name} (${target.profession})`
            })
          }
        />
      )}

      {lightboxImage && <LightboxModal image={lightboxImage} onClose={() => setLightboxImage(null)} />}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          categoryInfo={getCategoryInfo(selectedJob.category)}
          currentUser={sessionUser}
          isAdmin={isAdmin}
          prefillName={myProfiles[0]?.name ?? sessionUser?.displayName ?? ''}
          prefillPhone={myProfiles.find((p) => p.whatsapp)?.whatsapp ?? ''}
          applications={jobApplications.filter((a) => a.jobId === selectedJob.id)}
          showToast={showToast}
          onClose={() => setSelectedJobId(null)}
          onRequireLogin={() => openAuth('login', 'Inicia sesiÃ³n para postularte a esta vacante.')}
          onEditJob={(j) => {
            setSelectedJobId(null);
            setEditingJob(j);
            setIsJobFormOpen(true);
          }}
          onReport={(j) =>
            setReportTarget({
              targetType: 'job',
              targetId: j.id,
              targetTitle: `Vacante: ${j.title} - ${j.company}`
            })
          }
          onApplyJob={handleApplyJob}
        />
      )}

      {isJobFormOpen && (
        <JobFormModal
          editingJob={editingJob}
          showToast={showToast}
          onClose={() => {
            setIsJobFormOpen(false);
            setEditingJob(null);
          }}
          onSaveJob={handleSaveJob}
          onDeleteJob={handleDeleteJobByOwner}
        />
      )}

      {reportTarget && (
        <ReportModal
          reportData={reportTarget}
          showToast={showToast}
          onClose={() => setReportTarget(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {whatsappPreview && <WhatsappContactModal worker={whatsappPreview} onClose={() => setWhatsappPreview(null)} />}

      {authModalOpen && (
        <AuthAccountModal
          mode={authModalMode}
          setMode={setAuthModalMode}
          hint={authModalHint}
          showToast={showToast}
          onOpenPolicy={() => setPolicyOpen(true)}
          onAuthenticated={(goToPanel) => {
            setAuthModalOpen(false);
            if (goToPanel) navigate('mi_panel');
          }}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {policyOpen && <PolicyModal onClose={() => setPolicyOpen(false)} />}

      {deleteTarget && (
        <DeleteProfileModal
          profile={deleteTarget}
          byModerator={isAdmin && deleteTarget.ownerId !== currentUserId}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDeleteProfile()}
        />
      )}
    </div>
  );
}

// ============================================================================
// VENTANA: ELIMINAR PERFIL (Derecho de supresiÃ³n - Ley 1581 de 2012)
// ============================================================================
interface DeleteProfileModalProps {
  profile: Profile;
  byModerator: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteProfileModal({ profile, byModerator, deleting, onCancel, onConfirm }: DeleteProfileModalProps) {
  useEscapeKey(deleting ? () => undefined : onCancel);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-profile-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 id="delete-profile-title" className="text-lg font-extrabold text-slate-900">
          {byModerator
            ? `Â¿Eliminar definitivamente el perfil de ${profile.name}?`
            : `Â¿Confirmas la eliminaciÃ³n definitiva del perfil Â«${profile.name}Â» y su portafolio?`}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {byModerator
            ? 'AcciÃ³n de moderaciÃ³n: se eliminarÃ¡ el perfil del directorio y todas las fotografÃ­as de su portafolio. QuedarÃ¡ registrada en la auditorÃ­a.'
            : 'En cumplimiento del derecho de supresiÃ³n (Habeas Data - Ley 1581 de 2012), esta acciÃ³n eliminarÃ¡ este perfil profesional del directorio de La Reliquia y borrarÃ¡ todas las fotografÃ­as de su portafolio. No se puede deshacer.'}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {byModerator ? 'SÃ­, eliminar perfil' : 'SÃ­, eliminar mis datos'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VENTANA: VISOR AMPLIADO DE FOTOGRAFÃAS DEL PORTAFOLIO
// ============================================================================
function LightboxModal({ image, onClose }: { image: PortfolioItem; onClose: () => void }) {
  useEscapeKey(onClose);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
    >
      <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div>
            <h4 className="font-bold text-base">{image.title}</h4>
            <p className="text-xs text-blue-400">Trabajo realizado por {image.workerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-black max-h-[70vh] overflow-auto">
          <img src={image.imageUrl} alt={image.title} className="max-h-[65vh] w-auto object-contain rounded-lg" />
        </div>
        <div className="px-6 py-4 bg-slate-950 text-slate-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>{image.description}</p>
          <span className="text-xs text-slate-500 shrink-0">Formato verificado â€¢ {image.fileSizeKB} KB</span>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// VISTA 1: PÃGINA PRINCIPAL (INICIO)
// ============================================================================
function HomeView({
  approvedProfiles,
  portfolioItems,
  jobPostings,
  categoryStats,
  globalSearch,
  setGlobalSearch,
  onHeroSearch,
  onSelectCategory,
  onNavigate,
  onOpenWorker,
  onOpenJob,
  onOpenNewJob,
  onOpenRegister,
  onOpenPolicy,
  getCategoryInfo
}: HomeViewProps) {
  const openJobs = jobPostings.filter(isJobOpen);

  return (
    <div>
      {/* HERO PRINCIPAL */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>PLATAFORMA OFICIAL COMUNITARIA â€¢ BARRIO LA RELIQUIA, VILLAVICENCIO</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Conectamos el <span className="text-blue-500">talento de nuestros vecinos</span> con oportunidades reales de trabajo.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Encuentra maestros de obra, modistas, mecÃ¡nicos, tÃ©cnicos, gastronomÃ­a llanera y emprendimientos dentro del barrio La Reliquia, o postÃºlate a las vacantes locales sin intermediarios.
              </p>

              {/* Buscador General Unificado */}
              <form
                onSubmit={onHeroSearch}
                className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-3 px-3 py-2 flex-1">
                  <Search className="w-5 h-5 text-blue-800 shrink-0" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Â¿QuÃ© necesitas hoy? Ej: Maestro de obra, modista, electricista..."
                    className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shrink-0 shadow-sm"
                >
                  Buscar en La Reliquia
                </button>
              </form>

              {/* Botones Principales de AcciÃ³n */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenRegister}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  Registrar mi Oficio y Portafolio
                </button>
                <button
                  onClick={onOpenNewJob}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  Publicar Oferta de Empleo
                </button>
              </div>
            </div>

            {/* Tarjeta de Impacto Comunitario en Vivo */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                      IMPACTO EN TIEMPO REAL
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Comunidad La Reliquia Activa
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {approvedProfiles.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Trabajadores y Emprendedores
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {portfolioItems.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Fotos de Trabajos Reales
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {openJobs.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Vacantes de Empleo Abiertas
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {SECTORS.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Sectores del Barrio Cubiertos
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">
                      Trato directo y sin comisiones
                    </p>
                    <p className="mt-0.5 text-slate-400">
                      Contacta por WhatsApp directamente a los trabajadores que han autorizado mostrar su nÃºmero conforme a la Ley 1581 de 2012.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÃ“N DE CATEGORÃAS DE TRABAJADORES Y SERVICIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
              DIRECTORIO POR OFICIOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              CategorÃ­as de Trabajadores y Servicios
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Selecciona una categorÃ­a para explorar los perfiles y portafolios fotogrÃ¡ficos del barrio.
            </p>
          </div>
          <button
            onClick={() => onNavigate('directorio')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 hover:text-blue-900"
          >
            <span>Ver todo el directorio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const stats = categoryStats[cat.id] || { workers: 0, jobs: 0 };
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group text-left bg-white hover:bg-blue-50/50 p-5 rounded-2xl border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-blue-900 truncate">
                      {cat.name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-800 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] font-bold">
                    <span className="text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                      {stats.workers} {stats.workers === 1 ? 'trabajador' : 'trabajadores'}
                    </span>
                    {stats.jobs > 0 && (
                      <span className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                        {stats.jobs} {stats.jobs === 1 ? 'vacante' : 'vacantes'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECCIÃ“N DE TRABAJADORES DESTACADOS EN LA RELIQUIA */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                TALENTO VERIFICADO DEL BARRIO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Trabajadores y Emprendimientos Destacados
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Conoce la experiencia y fotografÃ­as reales de los trabajos realizados por tus vecinos.
              </p>
            </div>
            <button
              onClick={() => onNavigate('directorio')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
            >
              Explorar todos los perfiles ({approvedProfiles.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedProfiles.slice(0, 6).map((worker) => {
              const catInfo = getCategoryInfo(worker.category);
              const workerPhotos = portfolioItems.filter(
                (p) => p.profileId === worker.id && p.status !== 'flagged'
              );
              return (
                <div
                  key={worker.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-600 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {workerPhotos.length > 0 ? (
                    <div
                      onClick={() => onOpenWorker(worker)}
                      className="h-40 bg-slate-950 relative cursor-pointer overflow-hidden group"
                    >
                      <img
                        src={workerPhotos[0].imageUrl}
                        alt={workerPhotos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <span className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        {workerPhotos.length} {workerPhotos.length === 1 ? 'foto' : 'fotos'}
                      </span>
                      <p className="absolute bottom-2.5 left-3 right-3 text-xs text-blue-300 font-semibold truncate">
                        ðŸ“· {workerPhotos[0].title}
                      </p>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-r from-slate-900 to-blue-900 flex items-center px-5">
                      <span className="text-xs font-bold text-slate-100">
                        {catInfo.name}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-lg text-slate-900">
                              {worker.name}
                            </h3>
                            {worker.verified && (
                              <span title="Vecino con perfil verificado" className="inline-flex shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-blue-800">
                            {worker.profession}
                          </p>
                        </div>
                        {worker.rating !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {worker.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-700" />
                          {worker.sector}
                        </span>
                        <span>â€¢</span>
                        <span className="font-semibold text-blue-800">
                          {worker.experienceYears} aÃ±os exp.
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {worker.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(worker.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-lg">
                        {worker.availability}
                      </span>
                      <button
                        onClick={() => onOpenWorker(worker)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
                      >
                        Ver Perfil y Portafolio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECCIÃ“N DE OPORTUNIDADES RECIENTES EN LA BOLSA DE EMPLEO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
              CONTRATACIÃ“N LOCAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Oportunidades Laborales Recientes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Vacantes activas publicadas por comercios, talleres y contratistas de La Reliquia y Villavicencio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewJob}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm"
            >
              + Publicar Vacante
            </button>
            <button
              onClick={() => onNavigate('empleos')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm"
            >
              Ver todas ({openJobs.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {openJobs.slice(0, 4).map((job) => {
            const cat = getCategoryInfo(job.category);
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                      {cat.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                      â— Vacante Abierta
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {job.title}
                  </h3>
                  <p className="text-sm font-bold text-blue-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </p>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{job.sector}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 font-bold text-blue-900">
                      <DollarSign className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>RemuneraciÃ³n: {job.salaryCOP || 'A convenir'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Cierre: {job.closingDate}
                  </span>
                  <button
                    onClick={() => onOpenJob(job)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all"
                  >
                    Ver Requisitos y Postularse
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BANNER INSTITUCIONAL DE PROTECCIÃ“N DE DATOS Y MARCO REGULATORIO COLOMBIANO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600/80 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="inline-flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Seguridad JurÃ­dica y ProtecciÃ³n de Datos en Colombia</span>
              </div>
              <h3 className="text-xl font-black">
                Compromiso con la Ley 1581 de 2012 (Habeas Data) y Normativa Laboral
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                En <strong>La Reliquia Trabaja</strong> ningÃºn nÃºmero telefÃ³nico ni fotografÃ­a se publica sin el consentimiento libre, previo y expreso de su titular. AdemÃ¡s, informamos a la comunidad que esta plataforma funciona como un directorio vecinal gratuito de auto-publicaciÃ³n; para operar servicios formales de gestiÃ³n y colocaciÃ³n de empleo se debe revisar la autorizaciÃ³n ante el <strong>Ministerio del Trabajo / Unidad del Servicio PÃºblico de Empleo (Ley 1636 de 2013)</strong>.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <button
                onClick={onOpenRegister}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs text-center"
              >
                Configurar mi Privacidad y Consentimiento
              </button>
              <button
                type="button"
                onClick={onOpenPolicy}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs text-center"
              >
                Leer la PolÃ­tica de Tratamiento de Datos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// VISTA 2: DIRECTORIO DE TRABAJADORES Y EMPRENDIMIENTOS
// ============================================================================
function DirectoryView({
  filteredProfiles,
  portfolioItems,
  dirSearch,
  setDirSearch,
  dirCategory,
  setDirCategory,
  dirSector,
  setDirSector,
  dirAvailability,
  setDirAvailability,
  dirOnlyWithPhotos,
  setDirOnlyWithPhotos,
  onOpenWorker,
  onContactWhatsapp,
  onNavigate,
  getCategoryInfo
}: DirectoryViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            TALENTO DEL BARRIO LA RELIQUIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Directorio de Trabajadores, Oficios y Profesionales
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Filtra por oficio, sector del barrio o disponibilidad y revisa las fotos de sus trabajos antes de contratar.
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          Publicar o Editar mi Perfil
        </button>
      </div>

      {/* Barra de BÃºsqueda y Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              placeholder="Buscar por nombre, profesiÃ³n o habilidad (ej. enchape, moto, costura)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={dirCategory}
              onChange={(e) => setDirCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Todas las categorÃ­as</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dirSector}
              onChange={(e) => setDirSector(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Todos los sectores</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dirAvailability}
              onChange={(e) => setDirAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Cualquier disponibilidad</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={dirOnlyWithPhotos}
              onChange={(e) => setDirOnlyWithPhotos(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
            />
            <span>Mostrar Ãºnicamente perfiles con fotografÃ­as de trabajos en su portafolio</span>
          </label>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold">
              Mostrando <strong>{filteredProfiles.length}</strong> profesionales
            </span>
            {(dirSearch ||
              dirCategory !== 'todas' ||
              dirSector !== 'todos' ||
              dirAvailability !== 'todas' ||
              dirOnlyWithPhotos) && (
              <button
                onClick={() => {
                  setDirSearch('');
                  setDirCategory('todas');
                  setDirSector('todos');
                  setDirAvailability('todas');
                  setDirOnlyWithPhotos(false);
                }}
                className="text-blue-800 font-bold underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listado de Tarjetas del Directorio */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-800">
            No encontramos trabajadores con esos filtros especÃ­ficos
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Intenta ampliar tu bÃºsqueda a todos los sectores de La Reliquia o registra tu propio perfil si ofreces este servicio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((worker) => {
            const cat = getCategoryInfo(worker.category);
            const photos = portfolioItems.filter(
              (p) => p.profileId === worker.id && p.status !== 'flagged'
            );
            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="px-5 py-3 bg-slate-950 text-white flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 truncate">
                      {cat.name}
                    </span>
                    <span className="text-slate-300 font-medium shrink-0">
                      {worker.experienceYears} aÃ±os exp.
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{worker.name}</span>
                          {worker.verified && (
                            <span title="Perfil Verificado" className="inline-flex shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            </span>
                          )}
                        </h3>
                        <p className="text-sm font-bold text-blue-800">
                          {worker.profession}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] shrink-0">
                        {worker.availability}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{worker.sector}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {worker.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {(worker.skills || []).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {photos.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-blue-700" />
                          Portafolio de trabajos ({photos.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {photos.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => onOpenWorker(worker)}
                              className="h-20 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer group"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenWorker(worker)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs text-center transition-all"
                  >
                    Ver Portafolio Completo
                  </button>

                  {worker.consentPublicWhatsapp && worker.whatsapp ? (
                    <button
                      onClick={() => onContactWhatsapp(worker)}
                      className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-white" />
                      <span>WhatsApp</span>
                    </button>
                  ) : (
                    <span
                      className="py-2 px-2.5 rounded-xl bg-slate-200 text-slate-600 font-semibold text-[11px] inline-flex items-center gap-1"
                      title="El trabajador reservÃ³ su nÃºmero telefÃ³nico pÃºblico (Ley 1581)"
                    >
                      <Lock className="w-3 h-3" />
                      TelÃ©fono Privado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISTA 3: BOLSA DE EMPLEO COMUNITARIA
// ============================================================================
function JobsBoardView({
  filteredJobs,
  jobSearch,
  setJobSearch,
  jobCategory,
  setJobCategory,
  jobTypeFilter,
  setJobTypeFilter,
  jobModalityFilter,
  setJobModalityFilter,
  jobShowClosed,
  setJobShowClosed,
  onOpenJob,
  onOpenNewJob,
  onEditJob,
  currentUserId,
  isAdmin,
  getCategoryInfo
}: JobsBoardViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
            OPORTUNIDADES EN VILLAVICENCIO Y LA RELIQUIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Bolsa de Empleo Comunitaria
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Consulta vacantes locales o publica una oferta si necesitas contratar personal de nuestro barrio.
          </p>
        </div>

        <button
          onClick={onOpenNewJob}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Publicar Nueva Vacante
        </button>
      </div>

      {/* Filtros de Vacantes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              placeholder="Cargo, empresa o palabra clave..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Todas las categorÃ­as</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Cualquier tipo de jornada</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={jobModalityFilter}
              onChange={(e) => setJobModalityFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Toda modalidad</option>
              {JOB_MODALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <label className="inline-flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={jobShowClosed}
              onChange={(e) => setJobShowClosed(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
            />
            <span>Incluir tambiÃ©n convocatorias cerradas en el listado</span>
          </label>
          <span className="text-slate-500 font-semibold">
            {filteredJobs.length} vacantes encontradas
          </span>
        </div>
      </div>

      {/* Listado de Vacantes */}
      <div className="space-y-4">
        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-slate-800">No hay vacantes con esos filtros</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Prueba con otra bÃºsqueda, incluye las convocatorias cerradas o publica tu propia oferta de empleo.
            </p>
          </div>
        )}
        {filteredJobs.map((job) => {
          const cat = getCategoryInfo(job.category);
          const isOwner = (currentUserId !== null && job.authorId === currentUserId) || isAdmin;
          const isOpen = isJobOpen(job);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-600 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                    {cat.name}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                      isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isOpen ? 'â— Convocatoria Abierta' : 'Convocatoria Cerrada'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Publicada: {formatDate(job.publishedAt)} â€¢ Cierra: {formatDate(job.closingDate)}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5 text-blue-800">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    {job.sector} ({job.modality})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    {job.jobType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    <DollarSign className="w-4 h-4 text-slate-600" />
                    {job.salaryCOP || 'Salario a convenir'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => onOpenJob(job)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all text-center"
                >
                  Ver Detalles y Postularme
                </button>
                {isOwner && (
                  <button
                    onClick={() => onEditJob(job)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar / Cambiar Estado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VISTA 4: MI PANEL â€” PERFILES PROFESIONALES, PORTAFOLIO FOTOGRÃFICO Y PRIVACIDAD LEY 1581
// SeparaciÃ³n clara entre "Crear un perfil nuevo" y "Editar un perfil existente":
//   * Crear  -> formulario vacÃ­o; cada guardado genera un perfil NUEVO con id Ãºnico
//              y el formulario se limpia por completo al terminar.
//   * Editar -> carga SOLO el perfil elegido en "Mis perfiles"; nunca crea duplicados.
// ============================================================================
interface MyDashboardViewProps {
  user: SessionUser;
  myProfiles: Profile[];
  myPortfolio: PortfolioItem[];
  dataLoading: boolean;
  showToast: ShowToast;
  onOpenLightbox: (item: PortfolioItem) => void;
  onOpenWorkerPreview: (profile: Profile) => void;
  onOpenPolicy: () => void;
  onCreateProfile: (input: ProfileInput) => Promise<Profile | null>;
  onUpdateProfile: (id: string, input: ProfileInput) => Promise<Profile | null>;
  onRequestDeleteProfile: (profile: Profile) => void;
  onSavePortfolioItem: (
    profile: Profile,
    input: PortfolioInput,
    image: ProcessedImage | null,
    editingItem: PortfolioItem | null
  ) => Promise<boolean>;
  onDeletePortfolioItem: (item: PortfolioItem) => Promise<boolean>;
}

type ProfileSelection = { mode: 'create' } | { mode: 'edit'; profileId: string };

const PROFILE_STATUS_LABEL: Record<ProfileStatus, { label: string; className: string }> = {
  pending: { label: 'En revisiÃ³n de la Junta', className: 'bg-amber-100 text-amber-900' },
  approved: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
  suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800' }
};

function MyDashboardView({
  user,
  myProfiles,
  myPortfolio,
  dataLoading,
  showToast,
  onOpenLightbox,
  onOpenWorkerPreview,
  onOpenPolicy,
  onCreateProfile,
  onUpdateProfile,
  onRequestDeleteProfile,
  onSavePortfolioItem,
  onDeletePortfolioItem
}: MyDashboardViewProps) {
  const [dashboardTab, setDashboardTab] = useState<'perfil' | 'portafolio'>('perfil');
  const [userSelection, setUserSelection] = useState<ProfileSelection | null>(null);
  const [createCounter, setCreateCounter] = useState(0);
  const [lastCreated, setLastCreated] = useState<Profile | null>(null);

  // SelecciÃ³n efectiva: lo que eligiÃ³ la persona o, por defecto, su primer perfil (o "crear" si no tiene).
  const selection: ProfileSelection = useMemo(() => {
    if (userSelection?.mode === 'create') return userSelection;
    if (userSelection?.mode === 'edit') {
      const stillExists = myProfiles.some((p) => p.id === userSelection.profileId);
      if (stillExists) return userSelection;
    }
    return myProfiles[0] ? { mode: 'edit', profileId: myProfiles[0].id } : { mode: 'create' };
  }, [userSelection, myProfiles]);

  const editingProfile =
    selection.mode === 'edit' ? (myProfiles.find((p) => p.id === selection.profileId) ?? null) : null;

  const handleSubmitProfile = async (input: ProfileInput): Promise<boolean> => {
    if (selection.mode === 'create') {
      const created = await onCreateProfile(input);
      if (!created) return false;
      setLastCreated(created);
      setCreateCounter((count) => count + 1); // nueva "key" => formulario completamente limpio
      showToast(
        created.status === 'approved'
          ? `Â¡Perfil Â«${created.name}Â» creado y publicado en el directorio!`
          : `Â¡Perfil Â«${created.name}Â» creado! AparecerÃ¡ en el directorio cuando la Junta lo apruebe.`
      );
      return true;
    }
    const updated = await onUpdateProfile(selection.profileId, input);
    if (!updated) return false;
    showToast(`Cambios del perfil Â«${updated.name}Â» guardados correctamente.`);
    return true;
  };

  const startCreate = () => {
    setUserSelection({ mode: 'create' });
    setLastCreated(null);
    setDashboardTab('perfil');
  };

  const startEdit = (profile: Profile) => {
    setUserSelection({ mode: 'edit', profileId: profile.id });
    setLastCreated(null);
    setDashboardTab('perfil');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-2xl border-4 border-slate-800">
            {(user.displayName || 'V').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider mb-2 inline-block">
              MI PANEL DE USUARIO
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Hola, {user.displayName || 'Vecino'}</h1>
            <p className="text-sm text-slate-300 mt-1">
              Administra tus perfiles de oficio y sube fotografÃ­as de tus mejores trabajos.
            </p>
          </div>
        </div>

        {editingProfile && (
          <button
            type="button"
            onClick={() => onOpenWorkerPreview(editingProfile)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shrink-0 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            Ver mi perfil pÃºblico
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setDashboardTab('perfil')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-4 transition-all ${
            dashboardTab === 'perfil'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mis Perfiles y Privacidad
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab('portafolio')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-4 transition-all ${
            dashboardTab === 'portafolio'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mi Portafolio (Fotos)
        </button>
      </div>

      {dashboardTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de perfiles propios + crear nuevo */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-900 text-base">Mis perfiles ({myProfiles.length})</h2>
                {dataLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>

              <button
                type="button"
                onClick={startCreate}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm transition-all ${
                  selection.mode === 'create'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Crear un perfil nuevo
              </button>

              {myProfiles.length === 0 ? (
                <p className="text-xs text-slate-500 leading-relaxed">
                  AÃºn no tienes perfiles publicados. Completa el formulario para aparecer en el directorio de La
                  Reliquia.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {myProfiles.map((profile) => {
                    const isSelected = selection.mode === 'edit' && selection.profileId === profile.id;
                    const statusInfo = PROFILE_STATUS_LABEL[profile.status];
                    return (
                      <li
                        key={profile.id}
                        className={`rounded-xl border p-3.5 space-y-2.5 ${
                          isSelected ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-sm text-slate-900 truncate">{profile.name}</p>
                          <p className="text-xs font-semibold text-blue-800 truncate">{profile.profession}</p>
                        </div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(profile)}
                            className="flex-1 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-900 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 hover:bg-blue-50"
                          >
                            <Edit3 className="w-3 h-3" />
                            {isSelected ? 'Editando' : 'Editar este perfil'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenWorkerPreview(profile)}
                            className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                            title="Ver como lo ve el pÃºblico"
                            aria-label={`Ver perfil de ${profile.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDeleteProfile(profile)}
                            className="p-1.5 rounded-lg bg-white border border-slate-300 text-red-600 hover:bg-red-50"
                            title="Eliminar este perfil"
                            aria-label={`Eliminar perfil de ${profile.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Formulario: crear o editar */}
          <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {selection.mode === 'create' && lastCreated && (
              <div role="status" className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">Perfil Â«{lastCreated.name}Â» guardado.</p>
                  <p className="text-xs mt-0.5">
                    El formulario quedÃ³ limpio por si quieres registrar otro perfil distinto. Puedes encontrar el que
                    acabas de crear en Â«Mis perfilesÂ».
                  </p>
                </div>
              </div>
            )}

            {selection.mode === 'edit' && !editingProfile ? (
              <p className="text-sm text-slate-500">Cargando tu perfilâ€¦</p>
            ) : (
              <ProfileForm
                key={selection.mode === 'create' ? `crear-${createCounter}` : `editar-${selection.profileId}`}
                mode={selection.mode}
                initial={editingProfile}
                onSubmit={handleSubmitProfile}
                onOpenPolicy={onOpenPolicy}
                showToast={showToast}
              />
            )}
          </section>
        </div>
      )}

      {dashboardTab === 'portafolio' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <PortfolioManager
            myProfiles={myProfiles}
            myPortfolio={myPortfolio}
            showToast={showToast}
            onGoCreateProfile={startCreate}
            onOpenLightbox={onOpenLightbox}
            onSavePortfolioItem={onSavePortfolioItem}
            onDeletePortfolioItem={onDeletePortfolioItem}
          />
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Formulario de perfil (crear / editar)
// ----------------------------------------------------------------------------
interface ProfileFormState {
  name: string;
  profession: string;
  category: string;
  sector: string;
  experienceYears: string;
  skillsText: string;
  bio: string;
  availability: string;
  whatsapp: string;
  email: string;
  consentHabeasData: boolean;
  consentPublicWhatsapp: boolean;
}

const EMPTY_PROFILE_FORM: ProfileFormState = {
  name: '',
  profession: '',
  category: CATEGORIES[0].id,
  sector: SECTORS[0],
  experienceYears: '',
  skillsText: '',
  bio: '',
  availability: AVAILABILITY_OPTIONS[0],
  whatsapp: '',
  email: '',
  consentHabeasData: false,
  consentPublicWhatsapp: false
};

function profileToFormState(profile: Profile): ProfileFormState {
  return {
    name: profile.name,
    profession: profile.profession,
    category: profile.category,
    sector: profile.sector,
    experienceYears: String(profile.experienceYears ?? 0),
    skillsText: profile.skills.join(', '),
    bio: profile.bio,
    availability: profile.availability,
    whatsapp: profile.whatsapp ?? '',
    email: profile.email ?? '',
    consentHabeasData: profile.consentHabeasData,
    consentPublicWhatsapp: profile.consentPublicWhatsapp
  };
}

interface ProfileFormProps {
  mode: 'create' | 'edit';
  initial: Profile | null;
  onSubmit: (input: ProfileInput) => Promise<boolean>;
  onOpenPolicy: () => void;
  showToast: ShowToast;
}

function ProfileForm({ mode, initial, onSubmit, onOpenPolicy, showToast }: ProfileFormProps) {
  // El estado se inicializa UNA sola vez; el padre cambia la "key" para reiniciar el formulario.
  const [form, setForm] = useState<ProfileFormState>(() =>
    initial ? profileToFormState(initial) : { ...EMPTY_PROFILE_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const update = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fail = (message: string) => {
    setFormError(message);
    showToast(message, 'error');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');

    if (!form.consentHabeasData) {
      fail('Debes autorizar el tratamiento de datos personales (Ley 1581 de 2012) para publicar tu perfil.');
      return;
    }
    if (form.name.trim().length < 3) return fail('Escribe el nombre completo (mÃ­nimo 3 letras).');
    if (form.profession.trim().length < 2) return fail('Escribe la profesiÃ³n u oficio.');
    if (form.bio.trim().length < 10) return fail('La descripciÃ³n de servicios debe tener al menos 10 caracteres.');

    const skills = Array.from(
      new Set(
        form.skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
    if (skills.length === 0) return fail('Indica al menos una habilidad (separadas por coma).');
    if (skills.length > 15) return fail('Puedes registrar mÃ¡ximo 15 habilidades.');

    const phone = normalizePhone(form.whatsapp);
    if (phone && !isValidColombianMobile(phone)) {
      return fail('El celular debe tener 10 dÃ­gitos y empezar por 3 (ej. 3114567890).');
    }
    if (form.consentPublicWhatsapp && !phone) {
      return fail('Para mostrar el botÃ³n de WhatsApp debes escribir tu nÃºmero de celular.');
    }
    const email = form.email.trim();
    if (email && !isValidEmail(email)) return fail('El correo electrÃ³nico no es vÃ¡lido.');

    const years = Number(form.experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 70) {
      return fail('Los aÃ±os de experiencia deben estar entre 0 y 70.');
    }

    const input: ProfileInput = {
      name: form.name.trim(),
      profession: form.profession.trim(),
      category: form.category,
      sector: form.sector,
      experienceYears: Math.round(years),
      skills,
      bio: form.bio.trim(),
      availability: form.availability,
      whatsapp: phone || null,
      email: email || null,
      consentHabeasData: form.consentHabeasData,
      consentPublicWhatsapp: form.consentPublicWhatsapp
    };

    setSaving(true);
    try {
      await onSubmit(input);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 ${
            mode === 'create' ? 'bg-blue-100 text-blue-900' : 'bg-slate-200 text-slate-800'
          }`}
        >
          {mode === 'create' ? 'Nuevo perfil' : 'Editando perfil existente'}
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">
          {mode === 'create' ? 'Crear un perfil profesional nuevo' : 'InformaciÃ³n Profesional y de Oficio'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'create'
            ? 'Cada perfil que guardes aquÃ­ es independiente de los demÃ¡s. Completa los campos para aparecer en las bÃºsquedas del barrio.'
            : 'Los cambios se guardan Ãºnicamente en este perfil.'}
        </p>
      </div>

      {formError && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="pf-name" className="block text-xs font-bold text-slate-700 mb-1">
            Nombre Completo *
          </label>
          <input
            id="pf-name"
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ej. MarÃ­a Fernanda LÃ³pez"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label htmlFor="pf-profession" className="block text-xs font-bold text-slate-700 mb-1">
            ProfesiÃ³n, Oficio o Emprendimiento *
          </label>
          <input
            id="pf-profession"
            type="text"
            required
            maxLength={120}
            value={form.profession}
            onChange={(e) => update('profession', e.target.value)}
            placeholder="Ej. Maestra de ModisterÃ­a"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label htmlFor="pf-category" className="block text-xs font-bold text-slate-700 mb-1">
            CategorÃ­a Principal *
          </label>
          <select
            id="pf-category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-sector" className="block text-xs font-bold text-slate-700 mb-1">
            Sector de AtenciÃ³n *
          </label>
          <select
            id="pf-sector"
            value={form.sector}
            onChange={(e) => update('sector', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-years" className="block text-xs font-bold text-slate-700 mb-1">
            AÃ±os de Experiencia *
          </label>
          <input
            id="pf-years"
            type="number"
            min="0"
            max="70"
            required
            value={form.experienceYears}
            onChange={(e) => update('experienceYears', e.target.value)}
            placeholder="Ej. 5"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label htmlFor="pf-availability" className="block text-xs font-bold text-slate-700 mb-1">
            Disponibilidad Actual *
          </label>
          <select
            id="pf-availability"
            value={form.availability}
            onChange={(e) => update('availability', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pf-skills" className="block text-xs font-bold text-slate-700 mb-1">
          Habilidades y Especialidades (separadas por coma) *
        </label>
        <input
          id="pf-skills"
          type="text"
          required
          value={form.skillsText}
          onChange={(e) => update('skillsText', e.target.value)}
          placeholder="Ej. Enchape, Estuco, Pintura"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label htmlFor="pf-bio" className="block text-xs font-bold text-slate-700 mb-1">
          DescripciÃ³n de Servicios *
        </label>
        <textarea
          id="pf-bio"
          rows={3}
          required
          maxLength={1200}
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Describe quÃ© servicios ofreces a los habitantes de La Reliquia..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="pf-whatsapp" className="block text-xs font-bold text-slate-700 mb-1">
            Celular / WhatsApp (10 dÃ­gitos)
          </label>
          <input
            id="pf-whatsapp"
            type="tel"
            inputMode="numeric"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="Ej. 3114567890"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label htmlFor="pf-email" className="block text-xs font-bold text-slate-700 mb-1">
            Correo ElectrÃ³nico (privado: solo lo ve la Junta)
          </label>
          <input
            id="pf-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="tu@correo.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs uppercase">
          <ShieldCheck className="w-4 h-4 text-blue-800" />
          <span>Consentimiento Informado (Ley 1581 de 2012)</span>
        </div>
        <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={form.consentHabeasData}
            onChange={(e) => update('consentHabeasData', e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0"
          />
          <span>
            <strong>AutorizaciÃ³n obligatoria:</strong> Autorizo de manera voluntaria a la plataforma para publicar mi
            perfil en el directorio comunitario.{' '}
            <button type="button" onClick={onOpenPolicy} className="underline font-bold text-blue-900">
              Leer la PolÃ­tica de Tratamiento de Datos
            </button>
          </span>
        </label>
        <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer pt-3 border-t border-blue-200/70">
          <input
            type="checkbox"
            checked={form.consentPublicWhatsapp}
            onChange={(e) => update('consentPublicWhatsapp', e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0"
          />
          <span>
            <strong>WhatsApp pÃºblico (Opcional):</strong> Autorizo mostrar un botÃ³n de contacto directo a mi nÃºmero de
            WhatsApp en mi perfil pÃºblico. Si no lo marcas, tu nÃºmero NO se publica.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-sm shadow-sm transition-all inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Publicar mi Perfil Oficial' : 'Guardar Cambios del Perfil'}
        </button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------------
// Gestor del portafolio fotogrÃ¡fico
// ----------------------------------------------------------------------------
interface PortfolioManagerProps {
  myProfiles: Profile[];
  myPortfolio: PortfolioItem[];
  showToast: ShowToast;
  onGoCreateProfile: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
  onSavePortfolioItem: MyDashboardViewProps['onSavePortfolioItem'];
  onDeletePortfolioItem: MyDashboardViewProps['onDeletePortfolioItem'];
}

function PortfolioManager({
  myProfiles,
  myPortfolio,
  showToast,
  onGoCreateProfile,
  onOpenLightbox,
  onSavePortfolioItem,
  onDeletePortfolioItem
}: PortfolioManagerProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProfile = myProfiles.find((p) => p.id === selectedProfileId) ?? myProfiles[0] ?? null;
  const profilePhotos = activeProfile ? myPortfolio.filter((item) => item.profileId === activeProfile.id) : [];

  // Libera la URL temporal de la vista previa al cambiarla o al salir.
  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const resetPhotoForm = () => {
    setPhotoTitle('');
    setPhotoDescription('');
    setProcessed(null);
    setPreviewUrl('');
    setPhotoError('');
    setEditingItem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError('Formato no permitido. Usa Ãºnicamente imÃ¡genes JPG, PNG o WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_INPUT_IMAGE_MB * 1024 * 1024) {
      setPhotoError(
        `El archivo pesa ${Math.round(file.size / 1024 / 1024)} MB y supera el mÃ¡ximo de ${MAX_INPUT_IMAGE_MB} MB.`
      );
      e.target.value = '';
      return;
    }

    setProcessing(true);
    try {
      const result = await compressImage(file);
      setProcessed(result);
      setPreviewUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      setProcessed(null);
      setPhotoError(describeError(err, 'No se pudo procesar la imagen.'));
      e.target.value = '';
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || processing) return;
    if (!activeProfile) {
      setPhotoError('Primero crea un perfil profesional para poder subir fotografÃ­as.');
      return;
    }
    if (photoTitle.trim().length < 3 || photoDescription.trim().length < 3) {
      setPhotoError('Completa el tÃ­tulo y la descripciÃ³n (mÃ­nimo 3 caracteres cada uno).');
      return;
    }
    if (!editingItem && !processed) {
      setPhotoError('Selecciona una fotografÃ­a para subir.');
      return;
    }

    setSaving(true);
    try {
      const ok = await onSavePortfolioItem(
        activeProfile,
        { title: photoTitle, description: photoDescription },
        processed,
        editingItem
      );
      if (ok) {
        showToast(
          editingItem
            ? 'FotografÃ­a del portafolio actualizada correctamente.'
            : 'Â¡Nueva fotografÃ­a aÃ±adida a tu portafolio profesional!'
        );
        resetPhotoForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!window.confirm(`Â¿Eliminar la fotografÃ­a Â«${item.title}Â»?`)) return;
    const ok = await onDeletePortfolioItem(item);
    if (ok) {
      showToast('Foto eliminada.');
      if (editingItem?.id === item.id) resetPhotoForm();
    }
  };

  if (myProfiles.length === 0) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-sm font-semibold text-center space-y-4">
        <p>Primero debes crear un perfil profesional antes de subir fotografÃ­as.</p>
        <button
          type="button"
          onClick={onGoCreateProfile}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
        >
          Crear mi primer perfil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {myProfiles.length > 1 && (
        <div className="max-w-md">
          <label htmlFor="pm-profile" className="block text-xs font-bold text-slate-700 mb-1">
            Fotos del perfil:
          </label>
          <select
            id="pm-profile"
            value={activeProfile?.id ?? ''}
            onChange={(e) => {
              setSelectedProfileId(e.target.value);
              resetPhotoForm();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            {myProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} â€” {p.profession}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-800" />
                {editingItem ? 'Editar FotografÃ­a' : 'Subir FotografÃ­a'}
              </h3>
            </div>

            <div>
              <label htmlFor="ph-title" className="block text-xs font-bold text-slate-700 mb-1">
                TÃ­tulo del Trabajo *
              </label>
              <input
                id="ph-title"
                type="text"
                required
                maxLength={120}
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Ej. Enchape de baÃ±o"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div>
              <label htmlFor="ph-desc" className="block text-xs font-bold text-slate-700 mb-1">
                DescripciÃ³n del Trabajo *
              </label>
              <textarea
                id="ph-desc"
                rows={2}
                required
                maxLength={500}
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                placeholder="Explica brevemente quÃ© hiciste..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div>
              <label htmlFor="ph-file" className="block text-xs font-bold text-slate-700 mb-1">
                FotografÃ­a (JPG/PNG/WEBP â€¢ se optimiza a menos de 2 MB) {editingItem ? '(opcional)' : '*'}
              </label>
              <input
                id="ph-file"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer"
              />
              {processing && (
                <p className="mt-2 text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Optimizando imagenâ€¦
                </p>
              )}
            </div>

            {photoError && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {photoError}
              </div>
            )}

            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-300 bg-black relative">
                <img src={previewUrl} alt="Vista previa" className="w-full h-40 object-cover" />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              {editingItem && (
                <button
                  type="button"
                  onClick={resetPhotoForm}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={saving || processing}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? 'Guardar Cambios' : '+ Subir al Portafolio'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7">
          <h3 className="font-extrabold text-lg text-slate-900 mb-4 border-b border-slate-200 pb-2">
            Mis FotografÃ­as Publicadas ({profilePhotos.length})
          </h3>

          {profilePhotos.length === 0 ? (
            <div className="p-10 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold">No tienes fotos en este portafolio.</p>
              <p className="text-xs mt-1">Los perfiles con fotografÃ­as reales reciben mÃ¡s contactos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {profilePhotos.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col"
                >
                  <div className="h-32 bg-slate-900 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onClick={() => onOpenLightbox(item)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                    />
                    {item.status === 'flagged' && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                        Oculta por la Junta
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setPhotoTitle(item.title);
                        setPhotoDescription(item.description);
                        setProcessed(null);
                        setPreviewUrl(item.imageUrl);
                        setPhotoError('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-800 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 hover:bg-blue-50"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      aria-label={`Eliminar fotografÃ­a ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// VISTA 5: PANEL PRIVADO DE ADMINISTRACIÃ“N Y MODERACIÃ“N
// ============================================================================
function AdminDashboardView({
  isAdmin,
  isLoggedIn,
  profiles,
  portfolioItems,
  jobPostings,
  reports,
  adminLogs,
  onOpenLogin,
  onOpenWorker,
  onOpenJob,
  onLoadDemo,
  onRemoveDemo,
  onUpdateProfileStatus,
  onToggleProfileVerify,
  onDeleteProfile,
  onSetPortfolioStatus,
  onDeletePortfolio,
  onToggleJobStatus,
  onDeleteJob,
  onSetReportStatus
}: AdminDashboardViewProps) {
  const [adminSubTab, setAdminSubTab] = useState<'perfiles' | 'portafolios' | 'vacantes' | 'reportes'>('perfiles');
  const [busy, setBusy] = useState(false);

  /** Evita dobles clics mientras una acciÃ³n administrativa se estÃ¡ guardando. */
  const act = async (action: () => Promise<void> | void) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  // Defensa en profundidad: el servidor (RLS) igualmente rechaza cualquier acciÃ³n sin rol de administrador.
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Acceso Restringido a Administradores Autorizados</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Los permisos administrativos de <strong>La Reliquia Trabaja</strong> nunca se asignan automÃ¡ticamente al
            registrarse: los otorga la Junta directamente en la base de datos (tabla <code>public.user_roles</code>) y
            se validan en el servidor con Supabase RLS.
          </p>
          {!isLoggedIn && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm"
              >
                Iniciar sesiÃ³n como Junta
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const openReportTarget = (report: Report) => {
    if (report.targetType === 'profile') {
      const profile = profiles.find((p) => p.id === report.targetId);
      if (profile) onOpenWorker(profile);
    } else if (report.targetType === 'job') {
      const job = jobPostings.find((j) => j.id === report.targetId);
      if (job) onOpenJob(job);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
            PANEL DE GOBERNANZA Y MODERACIÃ“N COMUNITARIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">AdministraciÃ³n â€” La Reliquia Trabaja</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aprueba perfiles, modera fotografÃ­as, gestiona vacantes y audita cada acciÃ³n administrativa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 self-start md:self-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void act(onLoadDemo)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-blue-300 font-bold text-xs border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Cargar datos de demostraciÃ³n
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void act(onRemoveDemo)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-slate-300 font-bold text-xs border border-slate-700"
          >
            <Trash2 className="w-4 h-4" />
            Quitar datos de demostraciÃ³n
          </button>
        </div>
      </div>

      {/* EstadÃ­sticas Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Total Perfiles</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{profiles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Perfiles por Aprobar</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {profiles.filter((p) => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Fotos en Portafolio</p>
          <p className="text-2xl font-black text-blue-800 mt-1">{portfolioItems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Vacantes Activas</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{jobPostings.filter(isJobOpen).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Reportes Pendientes</p>
          <p className="text-2xl font-black text-red-600 mt-1">
            {reports.filter((r) => r.status === 'pendiente').length}
          </p>
        </div>
      </div>

      {/* Sub-pestaÃ±as de ModeraciÃ³n */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'perfiles', label: `Perfiles de Trabajadores (${profiles.length})` },
            { id: 'portafolios', label: `ModeraciÃ³n de Fotos (${portfolioItems.length})` },
            { id: 'vacantes', label: `RevisiÃ³n de Vacantes (${jobPostings.length})` },
            { id: 'reportes', label: `Reportes y AuditorÃ­a (${reports.length})` }
          ] as const
        ).map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setAdminSubTab(t.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              adminSubTab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adminSubTab === 'perfiles' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3.5 font-extrabold">Trabajador / Oficio</th>
                  <th className="p-3.5 font-extrabold">Sector</th>
                  <th className="p-3.5 font-extrabold">Consentimiento Ley 1581</th>
                  <th className="p-3.5 font-extrabold">Estado</th>
                  <th className="p-3.5 font-extrabold text-right">Acciones de ModeraciÃ³n</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      AÃºn no hay perfiles registrados.
                    </td>
                  </tr>
                )}
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {p.name}
                        {p.verified && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </p>
                      <p className="text-blue-800 font-semibold">{p.profession}</p>
                      {p.email && <p className="text-slate-500 mt-0.5">{p.email}</p>}
                    </td>
                    <td className="p-3.5 text-slate-600">{p.sector}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                        Habeas Data: {p.consentHabeasData ? 'SÃ­' : 'No'} â€¢ WhatsApp:{' '}
                        {p.consentPublicWhatsapp ? 'PÃºblico' : 'Privado'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          p.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {p.status === 'approved' ? 'Aprobado' : p.status === 'suspended' ? 'Suspendido' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenWorker(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Inspeccionar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act(() => onUpdateProfileStatus(p, p.status === 'approved' ? 'suspended' : 'approved'))
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-bold"
                      >
                        {p.status === 'approved' ? 'Suspender' : 'Aprobar'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(() => onToggleProfileVerify(p))}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold"
                      >
                        {p.verified ? 'Quitar Sello' : 'Verificar'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDeleteProfile(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 disabled:opacity-60 text-red-700 font-bold"
                        aria-label={`Eliminar perfil de ${p.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminSubTab === 'portafolios' && (
        <>
          {portfolioItems.length === 0 && (
            <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 text-center">
              AÃºn no hay fotografÃ­as en los portafolios.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover bg-slate-900" />
                    {item.status === 'flagged' && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                        Oculta al pÃºblico
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[11px] font-bold text-blue-800">Autor: {item.workerName}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    {item.fileFormat} â€¢ {item.fileSizeKB} KB
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void act(() => onSetPortfolioStatus(item, item.status === 'flagged' ? 'approved' : 'flagged'))
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1"
                    >
                      {item.status === 'flagged' ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Restaurar
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Ocultar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Â¿Eliminar definitivamente la fotografÃ­a Â«${item.title}Â»?`)) {
                          void act(() => onDeletePortfolio(item));
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Retirar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {adminSubTab === 'vacantes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3.5 font-extrabold">Cargo / Empleador</th>
                  <th className="p-3.5 font-extrabold">Sector</th>
                  <th className="p-3.5 font-extrabold">Salario</th>
                  <th className="p-3.5 font-extrabold">Estado</th>
                  <th className="p-3.5 font-extrabold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {jobPostings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      AÃºn no hay vacantes publicadas.
                    </td>
                  </tr>
                )}
                {jobPostings.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm">{j.title}</p>
                      <p className="text-blue-800 font-semibold">{j.company}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">{j.sector}</td>
                    <td className="p-3.5 font-semibold">{j.salaryCOP || 'A convenir'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          isJobOpen(j) ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {j.status === 'abierta' ? (isJobOpen(j) ? 'abierta' : 'vencida') : j.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenJob(j)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(() => onToggleJobStatus(j))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 disabled:opacity-60 text-white font-bold"
                      >
                        {j.status === 'abierta' ? 'Cerrar' : 'Reabrir'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(() => onDeleteJob(j))}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 disabled:opacity-60 text-red-700 font-bold"
                        aria-label={`Eliminar vacante ${j.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminSubTab === 'reportes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-600" />
              Reportes Comunitarios Recibidos ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No hay reportes pendientes de moderaciÃ³n en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{r.targetTitle || r.targetId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          r.status === 'pendiente' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <strong>Motivo:</strong> {r.reason} â€” {r.details}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(r.targetType === 'profile' || r.targetType === 'job') && (
                        <button
                          type="button"
                          onClick={() => openReportTarget(r)}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
                        >
                          Inspeccionar
                        </button>
                      )}
                      {r.status === 'pendiente' && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void act(() => onSetReportStatus(r, 'resuelto'))}
                            className="px-3 py-1 rounded-lg bg-blue-800 disabled:opacity-60 text-white font-bold"
                          >
                            Marcar Resuelto
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void act(() => onSetReportStatus(r, 'descartado'))}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-300 disabled:opacity-60 text-slate-700 font-bold"
                          >
                            Descartar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              Registro de Acciones Administrativas (Audit Log)
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 text-xs">
              {adminLogs.length === 0 && (
                <p className="text-slate-500 py-6 text-center">AÃºn no hay acciones registradas.</p>
              )}
              {adminLogs
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900">{log.action}</span> â€”{' '}
                      <span className="font-semibold">{log.targetName}</span>
                      <p className="text-slate-600 mt-0.5">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Por: {log.adminName || 'Administrador'}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VENTANA: POLÃTICA DE TRATAMIENTO DE DATOS PERSONALES (Ley 1581 de 2012)
// ============================================================================
function PolicyModal({ onClose }: { onClose: () => void }) {
  useEscapeKey(onClose);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-slate-950 text-white px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h3 id="policy-title" className="font-black text-base">
              PolÃ­tica de Tratamiento de Datos Personales
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
            aria-label="Cerrar polÃ­tica"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5 text-sm text-slate-700 leading-relaxed">
          <p className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-3">
            Ley 1581 de 2012 (Habeas Data) y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).
          </p>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">1. Responsable del tratamiento</h4>
            <p>
              Proyecto comunitario <strong>La Reliquia Trabaja</strong>, administrado por la Junta de AcciÃ³n Comunal del
              barrio La Reliquia, Villavicencio, Meta, Colombia.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">2. Datos que se recolectan</h4>
            <p>
              Nombre, oficio o profesiÃ³n, descripciÃ³n de servicios, sector del barrio, aÃ±os de experiencia, correo
              electrÃ³nico, nÃºmero de celular (opcional), fotografÃ­as de trabajos realizados y los datos de la cuenta de
              acceso. Las postulaciones a vacantes incluyen nombre, celular y un mensaje breve.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">3. Finalidad</h4>
            <p>
              Publicar tu perfil y portafolio en el directorio comunitario, facilitar el contacto directo entre vecinos y
              empleadores, gestionar la bolsa de empleo local y permitir la moderaciÃ³n de contenidos por parte de la
              Junta. Los datos no se venden ni se usan con fines comerciales.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">4. QuÃ© es pÃºblico y quÃ© es privado</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tu nÃºmero de WhatsApp solo se muestra si marcas la autorizaciÃ³n expresa Â«WhatsApp pÃºblicoÂ».</li>
              <li>Tu correo electrÃ³nico nunca se publica: Ãºnicamente lo ve la Junta administradora.</li>
              <li>Tu perfil solo aparece en el directorio despuÃ©s de ser aprobado por la Junta.</li>
              <li>Los datos de una postulaciÃ³n solo los ven quien se postula, quien publicÃ³ la vacante y la Junta.</li>
            </ul>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">5. Tus derechos como titular</h4>
            <p>
              Conocer, actualizar y rectificar tus datos; solicitar prueba de la autorizaciÃ³n otorgada; ser informado del
              uso que se les da; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorizaciÃ³n
              y solicitar la supresiÃ³n de tus datos.
            </p>
            <p>
              Puedes editar o eliminar tus perfiles y fotografÃ­as en cualquier momento desde <strong>Mi Panel</strong>. Para
              solicitar la eliminaciÃ³n completa de tu cuenta de acceso o ejercer cualquier otro derecho, comunÃ­cate con la
              Junta de AcciÃ³n Comunal del barrio.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">6. Seguridad y almacenamiento</h4>
            <p>
              La informaciÃ³n se almacena en una plataforma de base de datos en la nube con control de acceso por usuario.
              Los proveedores de infraestructura pueden operar servidores fuera de Colombia (transmisiÃ³n internacional de
              datos con fines de alojamiento).
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-extrabold text-slate-900">7. Menores de edad</h4>
            <p>La plataforma estÃ¡ dirigida a personas mayores de 18 aÃ±os. Los menores solo pueden participar con autorizaciÃ³n de sus padres o tutores.</p>
          </section>

          <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            Texto base informativo. La Junta de AcciÃ³n Comunal debe revisarlo con asesorÃ­a jurÃ­dica y completarlo con sus
            datos oficiales de contacto antes de su adopciÃ³n formal.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISTA 6: CENTRO TÃ‰CNICO PARA LA JUNTA (solo administradores)
// ============================================================================
const PROJECT_STRUCTURE = `la-reliquia-trabaja/
â”œâ”€â”€ .env                         # VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
â”œâ”€â”€ index.html                   # Punto de entrada
â”œâ”€â”€ main.tsx                     # Renderizado raÃ­z de React
â”œâ”€â”€ la_reliquia_trabaja_plataforma_comunitaria.tsx   # Interfaz completa
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ api.ts                   # Auth + lectura/escritura en Supabase
â”‚   â”œâ”€â”€ mappers.ts               # camelCase <-> snake_case
â”‚   â”œâ”€â”€ catalogs.ts Â· seed.ts Â· types.ts Â· utils.ts Â· supabase.ts
â”œâ”€â”€ supabase/schema.sql          # Script SQL definitivo (tablas, RLS, Storage)
â”œâ”€â”€ netlify.toml                 # CompilaciÃ³n y despliegue en Netlify
â””â”€â”€ tailwind.config.js Â· postcss.config.js Â· tsconfig.json`;

function TechnicalArchitectureView({ showToast }: { showToast: ShowToast }) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlSchema, setSqlSchema] = useState<string>('Cargando script SQLâ€¦');

  useEffect(() => {
    let cancelled = false;
    import('./supabase/schema.sql?raw')
      .then((module) => {
        if (!cancelled) setSqlSchema(module.default);
      })
      .catch(() => {
        if (!cancelled) setSqlSchema('No se pudo cargar el script. Consulta el archivo supabase/schema.sql del repositorio.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopiedSql(true);
      showToast('Script SQL completo con RLS y Storage copiado al portapapeles.');
      window.setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      showToast('No se pudo copiar automÃ¡ticamente. Selecciona el texto y cÃ³pialo manualmente.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
        <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
          DOCUMENTACIÃ“N TÃ‰CNICA â€” SOLO JUNTA ADMINISTRADORA
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">
          Base de Datos (Supabase PostgreSQL + RLS) y Vite / React
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Artefactos de infraestructura del repositorio GitHub, Supabase y Netlify.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-blue-400">supabase/schema.sql</span>
            </div>
            <button
              type="button"
              onClick={() => void handleCopySql()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Â¡Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs font-mono overflow-x-auto max-h-[560px] leading-relaxed text-slate-300">
            {sqlSchema}
          </pre>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <FolderGit2 className="w-4 h-4" />
              <span>Estructura del Proyecto</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-blue-300 text-[11px] font-mono overflow-x-auto leading-relaxed">
              {PROJECT_STRUCTURE}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Variables de Entorno (.env y Netlify)</h3>
            <p className="text-xs text-slate-600">
              Usa Ãºnicamente la clave pÃºblica anÃ³nima protegida por polÃ­ticas RLS. Nunca publiques la clave
              <code> service_role</code>:
            </p>
            <pre className="p-3 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-mono overflow-x-auto">
              {`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\nVITE_SUPABASE_ANON_KEY=sb_publishable_...`}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5 text-xs text-slate-800">
            <h3 className="font-extrabold text-sm">Puesta en marcha (una sola vez)</h3>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Supabase â†’ SQL Editor: ejecutar <code>supabase/schema.sql</code> completo.</li>
              <li>Authentication â†’ URL Configuration: poner la URL de Netlify como Â«Site URLÂ» y en Â«Redirect URLsÂ».</li>
              <li>Cada integrante de la Junta se registra normalmente en la plataforma.</li>
              <li>SQL Editor: asignar el rol con el bloque Â«NOMBRAR ADMINISTRADORESÂ» al final del script.</li>
              <li>Netlify â†’ Environment variables: definir las dos variables VITE_ y volver a desplegar.</li>
            </ol>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5 text-xs text-slate-800">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600" />
              Checklist Regulatorio Colombia
            </h3>
            <p>
              <strong>1. Ley 1581 de 2012 y Decreto 1377 de 2013:</strong> Se exige autorizaciÃ³n previa e informada para
              publicar datos personales y nÃºmero de WhatsApp, con opciÃ³n de revocatoria y supresiÃ³n inmediata.
            </p>
            <p>
              <strong>2. Servicio PÃºblico de Empleo (Ley 1636 de 2013):</strong> Opera como directorio comunitario
              gratuito de contacto vecinal directo y cartelera abierta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// COMPONENTES DE MODALES INTERACTIVOS
// ============================================================================
function WorkerProfileModal({
  worker,
  portfolio,
  categoryInfo,
  onClose,
  onOpenLightbox,
  onContactWhatsapp,
  onReport
}: WorkerProfileModalProps) {
  useEscapeKey(onClose);
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${worker.name}`}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="bg-slate-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                {categoryInfo.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 flex items-center gap-2">
                <span>{worker.name}</span>
                {worker.verified && (
                  <span title="Identidad y oficio verificados en La Reliquia" className="inline-flex">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </span>
                )}
              </h2>
              <p className="text-base font-bold text-slate-300">
                {worker.profession}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1 shrink-0">
              <p className="font-bold text-blue-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {worker.sector}
              </p>
              <p className="text-slate-300">
                Experiencia: <strong>{worker.experienceYears} aÃ±os</strong>
              </p>
              <p className="text-slate-300">
                Disponibilidad: <strong>{worker.availability}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {worker.status !== 'approved' && (
            <div role="status" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
              {worker.status === 'pending'
                ? 'Este perfil estÃ¡ en revisiÃ³n: solo lo ven su dueÃ±o y la Junta. Se publicarÃ¡ en el directorio cuando sea aprobado.'
                : 'Este perfil estÃ¡ suspendido por la Junta y no es visible para el pÃºblico.'}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Sobre mis servicios en La Reliquia
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {worker.bio}
              </p>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Habilidades y Especialidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(worker.skills || []).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs"
                    >
                      âœ“ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Contacto Directo
                </h4>
                {worker.consentPublicWhatsapp && worker.whatsapp ? (
                  <>
                    <p className="text-xs text-slate-600">
                      Este trabajador autorizÃ³ publicar su lÃ­nea de WhatsApp para cotizaciones y contrataciones:
                    </p>
                    <p className="text-base font-black text-blue-900">
                      +57 {worker.whatsapp}
                    </p>
                    <button
                      onClick={() => onContactWhatsapp(worker)}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="w-4 h-4 text-white" />
                      Escribir por WhatsApp
                    </button>
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-200/80 text-xs text-slate-700 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-slate-600" />
                      NÃºmero TelefÃ³nico Reservado
                    </p>
                    <p>
                      Por configuraciÃ³n de privacidad (Ley 1581 de 2012), este vecino prefiriÃ³ no publicar su nÃºmero de WhatsApp.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => onReport(worker)}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 inline-flex items-center gap-1 self-start"
              >
                <Flag className="w-3.5 h-3.5" />
                Reportar perfil a moderaciÃ³n
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-800" />
                  Portafolio de Trabajos Realizados ({portfolio.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Haz clic sobre cualquier fotografÃ­a para ampliarla en pantalla completa.
                </p>
              </div>
            </div>

            {portfolio.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Este trabajador aÃºn no ha subido fotografÃ­as a su galerÃ­a.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenLightbox(item)}
                    className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-600 transition-all"
                  >
                    <div className="h-48 bg-slate-950 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        Ampliar foto
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsappContactModal({ worker, onClose }: WhatsappContactModalProps) {
  useEscapeKey(onClose);
  const cleanPhone = normalizePhone(worker.whatsapp ?? '');
  const message = encodeURIComponent(
    `Hola ${worker.name}, vi tu perfil de *${worker.profession}* en la plataforma comunitaria *La Reliquia Trabaja* (Villavicencio) y me gustarÃ­a cotizar un servicio.`
  );
  const waUrl = `https://wa.me/57${cleanPhone}?text=${message}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Contactar a ${worker.name}`}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs">
            CONTACTO VECINAL DIRECTO
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">
            Contactar a {worker.name}
          </h3>
          <p className="text-xs font-bold text-blue-800">{worker.profession}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <p className="text-slate-500 font-semibold">
            LÃ­nea autorizada en Colombia: <strong>+57 {cleanPhone}</strong>
          </p>
          <p className="text-slate-700 italic">
            "Hola {worker.name}, vi tu perfil de {worker.profession} en la plataforma comunitaria La Reliquia Trabaja y me gustarÃ­a cotizar un servicio."
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cerrar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            Abrir WhatsApp Ahora
          </a>
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({
  job,
  categoryInfo,
  currentUser,
  isAdmin,
  prefillName,
  prefillPhone,
  applications,
  showToast,
  onClose,
  onRequireLogin,
  onEditJob,
  onReport,
  onApplyJob
}: JobDetailModalProps) {
  const [applicantName, setApplicantName] = useState(prefillName);
  const [applicantPhone, setApplicantPhone] = useState(prefillPhone);
  const [applicantMessage, setApplicantMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  useEscapeKey(onClose);

  const isAuthor = Boolean(currentUser) && job.authorId === currentUser?.id;
  const isOwner = isAuthor || isAdmin;
  const jobIsOpen = isJobOpen(job);
  const myApplication = currentUser ? applications.find((a) => a.applicantId === currentUser.id) : undefined;
  const employerPhone = normalizePhone(job.contactWhatsapp);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFormError('');
    const phone = normalizePhone(applicantPhone);
    if (applicantName.trim().length < 3) {
      setFormError('Escribe tu nombre completo (mÃ­nimo 3 letras).');
      return;
    }
    if (!isValidColombianMobile(phone)) {
      setFormError('Tu celular debe tener 10 dÃ­gitos y empezar por 3 (ej. 3114567890).');
      return;
    }
    if (applicantMessage.trim().length < 5) {
      setFormError('CuÃ©ntale al empleador un poco sobre ti (mÃ­nimo 5 caracteres).');
      return;
    }

    setSending(true);
    try {
      const ok = await onApplyJob({
        jobId: job.id,
        applicantName: applicantName.trim(),
        applicantPhone: phone,
        applicantMessage: applicantMessage.trim()
      });
      if (ok) {
        showToast(`Â¡Tu postulaciÃ³n a "${job.title}" fue enviada con Ã©xito!`);
        setApplicantMessage('');
      }
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="bg-slate-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
            {categoryInfo.name}
          </span>
          <h2 className="text-2xl font-black mt-2 pr-10">{job.title}</h2>
          <p className="text-sm font-bold text-slate-300 mt-0.5">
            {job.company} â€¢ {job.sector}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Tipo de jornada</span>
              <strong className="text-slate-900">{job.jobType}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Modalidad</span>
              <strong className="text-slate-900">{job.modality}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">RemuneraciÃ³n (COP)</span>
              <strong className="text-blue-900">{job.salaryCOP || 'A convenir'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha lÃ­mite</span>
              <strong className="text-slate-900">{formatDate(job.closingDate)}</strong>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500 mb-2">
              DescripciÃ³n de la Vacante
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500 mb-2">
              Requisitos del Cargo
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {(job.requirements || []).map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {!jobIsOpen ? (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold text-center">
              Esta convocatoria ya se encuentra cerrada.
            </div>
          ) : isAuthor ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold text-center">
              Esta es tu vacante. Las postulaciones recibidas aparecen mÃ¡s abajo.
            </div>
          ) : !currentUser ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <h4 className="font-extrabold text-base text-blue-950">Postularme a esta vacante</h4>
              <p className="text-xs text-blue-900">
                Para enviar tu postulaciÃ³n necesitas una cuenta gratuita. AsÃ­ protegemos tus datos (Ley 1581 de 2012).
              </p>
              <button
                type="button"
                onClick={onRequireLogin}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
              >
                Iniciar sesiÃ³n o registrarme
              </button>
            </div>
          ) : myApplication ? (
            <div role="status" className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs font-bold">
              Ya te postulaste a esta vacante el {formatDate(myApplication.createdAt)}. El empleador podrÃ¡ contactarte
              al {myApplication.applicantPhone}.
            </div>
          ) : (
            <form
              onSubmit={handleApply}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3.5"
            >
              <h4 className="font-extrabold text-base text-blue-950">Postularme a esta vacante</h4>
              {formError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Tu nombre completo *"
                  aria-label="Tu nombre completo"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="Tu celular / WhatsApp (10 dÃ­gitos) *"
                  aria-label="Tu celular o WhatsApp"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <textarea
                rows={2}
                required
                maxLength={1000}
                value={applicantMessage}
                onChange={(e) => setApplicantMessage(e.target.value)}
                placeholder="CuÃ©ntale brevemente al empleador tu experiencia y en quÃ© sector de La Reliquia vives..."
                aria-label="Mensaje para el empleador"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              />
              <p className="text-[11px] text-blue-900">
                Al postularte autorizas que el empleador vea tu nombre, celular y mensaje (Ley 1581 de 2012).
              </p>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-xs inline-flex items-center gap-2"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar PostulaciÃ³n Ahora
                </button>
              </div>
            </form>
          )}

          {(job.contactWhatsapp || job.contactEmail) && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
              <span className="text-slate-700">
                Contacto directo del empleador:{' '}
                <strong className="text-slate-900">
                  {[employerPhone ? `+57 ${employerPhone}` : '', job.contactEmail].filter(Boolean).join(' â€¢ ')}
                </strong>
              </span>
              {employerPhone && (
                <a
                  href={`https://wa.me/57${employerPhone}?text=${encodeURIComponent(
                    `Hola, vi la vacante "${job.title}" en La Reliquia Trabaja y me interesa.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  Escribir por WhatsApp
                </a>
              )}
            </div>
          )}

          {isOwner && applications.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-2">
                Vecinos postulados ({applications.length})
              </h4>
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <strong className="text-slate-900">{app.applicantName}</strong> â€”{' '}
                      <span className="text-slate-600">{app.applicantMessage}</span>
                    </div>
                    <a
                      href={`https://wa.me/57${normalizePhone(app.applicantPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-800 font-bold shrink-0 underline"
                    >
                      {app.applicantPhone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <button
              onClick={() => onReport(job)}
              className="text-slate-500 hover:text-red-600 font-semibold inline-flex items-center gap-1"
            >
              <Flag className="w-3.5 h-3.5" />
              Reportar oferta
            </button>
            {isOwner && (
              <button
                onClick={() => onEditJob(job)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Editar o Cerrar Vacante
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobFormModal({ editingJob, showToast, onClose, onSaveJob, onDeleteJob }: JobFormModalProps) {
  const [form, setForm] = useState({
    title: editingJob?.title ?? '',
    company: editingJob?.company ?? '',
    category: editingJob?.category ?? CATEGORIES[0].id,
    sector: editingJob?.sector ?? SECTORS[0],
    jobType: editingJob?.jobType ?? JOB_TYPES[0],
    modality: editingJob?.modality ?? JOB_MODALITIES[0],
    salaryCOP: editingJob?.salaryCOP ?? '',
    description: editingJob?.description ?? '',
    requirementsText: (editingJob?.requirements ?? []).join('\n'),
    closingDate: editingJob?.closingDate ?? addDaysISO(30),
    status: editingJob?.status ?? ('abierta' as JobInput['status']),
    contactWhatsapp: editingJob?.contactWhatsapp ?? '',
    contactEmail: editingJob?.contactEmail ?? ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  useEscapeKey(onClose);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || deleting) return;
    setFormError('');

    const requirements = form.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    const phone = normalizePhone(form.contactWhatsapp);
    const email = form.contactEmail.trim();

    if (form.title.trim().length < 3) return setFormError('Escribe el nombre del cargo (mÃ­nimo 3 letras).');
    if (form.company.trim().length < 2) return setFormError('Escribe el nombre de la empresa o contratista.');
    if (form.description.trim().length < 10) {
      return setFormError('La descripciÃ³n debe tener al menos 10 caracteres.');
    }
    if (requirements.length === 0) return setFormError('Escribe al menos un requisito (uno por lÃ­nea).');
    if (!phone && !email) {
      return setFormError('Indica al menos un medio de contacto: WhatsApp o correo electrÃ³nico.');
    }
    if (phone && !isValidColombianMobile(phone)) {
      return setFormError('El WhatsApp debe tener 10 dÃ­gitos y empezar por 3 (ej. 3114567890).');
    }
    if (email && !isValidEmail(email)) return setFormError('El correo de contacto no es vÃ¡lido.');
    if (!editingJob && form.closingDate < todayISO()) {
      return setFormError('La fecha de cierre no puede ser anterior a hoy.');
    }

    const input: JobInput = {
      title: form.title.trim(),
      company: form.company.trim(),
      category: form.category,
      sector: form.sector,
      jobType: form.jobType,
      modality: form.modality,
      salaryCOP: form.salaryCOP.trim() || 'A convenir',
      description: form.description.trim(),
      requirements,
      contactWhatsapp: phone,
      contactEmail: email,
      status: form.status,
      closingDate: form.closingDate
    };

    setSaving(true);
    try {
      const ok = await onSaveJob(editingJob ? editingJob.id : null, input);
      if (ok) {
        showToast(
          editingJob
            ? 'Oferta laboral actualizada correctamente.'
            : 'Â¡Nueva vacante publicada en la Bolsa de Empleo de La Reliquia!'
        );
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingJob || saving || deleting) return;
    if (!window.confirm(`Â¿Eliminar definitivamente la vacante Â«${editingJob.title}Â»? Se borrarÃ¡n sus postulaciones.`)) {
      return;
    }
    setDeleting(true);
    try {
      const ok = await onDeleteJob(editingJob);
      if (ok) {
        showToast('Vacante eliminada.');
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {editingJob ? 'Editar Vacante de Empleo' : 'Publicar Vacante en La Reliquia'}
            </h3>
            <p className="text-xs text-slate-500">
              Conecta tu negocio, taller u obra con trabajadores del barrio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nombre del Cargo *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Oficial de ConstrucciÃ³n / Auxiliar de PanaderÃ­a"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Empresa, Negocio o Contratista *
              </label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Ej. PanaderÃ­a El Trigal / Maestro Carlos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                CategorÃ­a *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                UbicaciÃ³n / Sector *
              </label>
              <select
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tipo de Trabajo *
              </label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Modalidad *
              </label>
              <select
                value={form.modality}
                onChange={(e) => setForm({ ...form, modality: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {JOB_MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                RemuneraciÃ³n en Pesos (COP $)
              </label>
              <input
                type="text"
                value={form.salaryCOP}
                onChange={(e) => setForm({ ...form, salaryCOP: e.target.value })}
                placeholder="Ej. $1.450.000 mensual o $75.000 dÃ­a"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Fecha de Cierre *
              </label>
              <input
                type="date"
                required
                min={editingJob ? undefined : todayISO()}
                value={form.closingDate}
                onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              DescripciÃ³n de Funciones y Horario *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Requisitos (uno por lÃ­nea) *
            </label>
            <textarea
              rows={3}
              required
              value={form.requirementsText}
              onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
              placeholder={`Vivir en La Reliquia\nExperiencia mÃ­nima de 6 meses`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                WhatsApp para Postulaciones
              </label>
              <input
                type="tel"
                value={form.contactWhatsapp}
                onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                placeholder="3110000000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Correo de Contacto
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="empleo@negocio.co"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Estado de la Oferta
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as JobInput['status'] })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>

          {formError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {formError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            {editingJob && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving || deleting}
                className="mr-auto inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-red-700 hover:bg-red-50 disabled:opacity-60 font-bold"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar vacante
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || deleting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-sm inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingJob ? 'Guardar Cambios' : 'Publicar Vacante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportModal({ reportData, showToast, onClose, onSubmitReport }: ReportModalProps) {
  const [reason, setReason] = useState('InformaciÃ³n falsa o engaÃ±osa');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  useEscapeKey(onClose);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const ok = await onSubmitReport({
        targetType: reportData.targetType,
        targetId: reportData.targetId,
        targetTitle: reportData.targetTitle,
        reason,
        details
      });
      if (ok) {
        showToast('Reporte enviado al equipo de moderaciÃ³n de La Reliquia Trabaja.');
        onClose();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
      >
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-600" />
          Reportar PublicaciÃ³n a ModeraciÃ³n
        </h3>
        <p className="text-xs font-bold text-slate-600">{reportData.targetTitle}</p>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motivo del reporte
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            <option>InformaciÃ³n falsa o engaÃ±osa</option>
            <option>Cobro indebido por postulaciÃ³n</option>
            <option>FotografÃ­a inapropiada o que no corresponde</option>
            <option>SuplantaciÃ³n de identidad</option>
            <option>Otro motivo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detalles adicionales *
          </label>
          <textarea
            rows={3}
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe quÃ© ocurre para que el administrador lo revise..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-extrabold text-xs inline-flex items-center gap-2"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar Reporte
          </button>
        </div>
      </form>
    </div>
  );
}

function AuthAccountModal({
  mode,
  setMode,
  hint,
  showToast,
  onOpenPolicy,
  onAuthenticated,
  onClose
}: AuthAccountModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptHabeasData, setAcceptHabeasData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEscapeKey(onClose);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage('');
    setNotice('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage('');
    setNotice('');

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'La plataforma no estÃ¡ conectada a Supabase (faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY), por eso no se puede iniciar sesiÃ³n.'
      );
      return;
    }

    if (mode !== 'recover' && passwordInput.length < 8) {
      setErrorMessage('La contraseÃ±a debe tener al menos 8 caracteres.');
      return;
    }
    if (mode === 'register') {
      if (!acceptHabeasData) {
        setErrorMessage('Debes aceptar el tratamiento de datos personales para registrarte.');
        showToast('Debes aceptar el tratamiento de datos personales para registrarte.', 'error');
        return;
      }
      if (nameInput.trim().length < 3) {
        setErrorMessage('Escribe tu nombre completo (mÃ­nimo 3 letras).');
        return;
      }
    }
    if (mode !== 'reset' && !isValidEmail(emailInput)) {
      setErrorMessage('Escribe un correo electrÃ³nico vÃ¡lido.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInAccount(emailInput, passwordInput);
        showToast('SesiÃ³n iniciada correctamente.');
        onAuthenticated(false);
      } else if (mode === 'register') {
        const { needsEmailConfirmation } = await signUpAccount(emailInput, passwordInput, nameInput);
        if (needsEmailConfirmation) {
          setNotice(
            `Te enviamos un correo de confirmaciÃ³n a ${emailInput.trim()}. Ãbrelo y pulsa el enlace para activar tu cuenta (revisa tambiÃ©n la carpeta de spam).`
          );
        } else {
          showToast(`Cuenta creada. Â¡Bienvenido/a, ${nameInput.trim()}!`);
          onAuthenticated(true);
        }
      } else if (mode === 'recover') {
        await sendPasswordReset(emailInput);
        setNotice(
          `Si ${emailInput.trim()} tiene una cuenta, recibirÃ¡ un enlace para crear una contraseÃ±a nueva. Revisa tu bandeja de entrada.`
        );
      } else {
        await setNewPassword(passwordInput);
        showToast('ContraseÃ±a actualizada correctamente.');
        onAuthenticated(false);
      }
    } catch (err) {
      console.error('[La Reliquia Trabaja] Error de autenticaciÃ³n:', err);
      setErrorMessage(describeError(err, 'No se pudo completar la operaciÃ³n.'));
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === 'login'
      ? 'Iniciar SesiÃ³n'
      : mode === 'register'
        ? 'Registro en La Reliquia'
        : mode === 'recover'
          ? 'Recuperar ContraseÃ±a'
          : 'Crear ContraseÃ±a Nueva';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 id="auth-title" className="text-lg font-black text-slate-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hint && mode !== 'reset' && (
          <p className="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-3 font-semibold">{hint}</p>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="flex gap-2 text-xs bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => changeMode('login')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar SesiÃ³n
            </button>
            <button
              type="button"
              onClick={() => changeMode('register')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {notice ? (
          <div role="status" className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-900 space-y-3">
            <p className="flex items-start gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>{notice}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                {errorMessage}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="font-bold text-slate-700 block mb-1">
                  Nombre Completo *
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ej. Juan PÃ©rez"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <label htmlFor="auth-email" className="font-bold text-slate-700 block mb-1">
                  Correo ElectrÃ³nico *
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            {mode !== 'recover' && (
              <div>
                <label htmlFor="auth-password" className="font-bold text-slate-700 block mb-1">
                  {mode === 'reset' ? 'ContraseÃ±a nueva *' : 'ContraseÃ±a *'}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="MÃ­nimo 8 caracteres"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    aria-label={showPassword ? 'Ocultar contraseÃ±a' : 'Mostrar contraseÃ±a'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => changeMode('recover')}
                className="text-blue-800 font-bold underline"
              >
                Â¿Olvidaste tu contraseÃ±a?
              </button>
            )}

            {mode === 'recover' && (
              <button type="button" onClick={() => changeMode('login')} className="text-blue-800 font-bold underline">
                Volver a iniciar sesiÃ³n
              </button>
            )}

            {mode === 'register' && (
              <label className="flex items-start gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  required
                  checked={acceptHabeasData}
                  onChange={(e) => setAcceptHabeasData(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0"
                />
                <span className="text-slate-800 text-[11px] leading-relaxed">
                  <strong>AutorizaciÃ³n (Ley 1581 de 2012):</strong> Acepto el tratamiento de mis datos personales para
                  crear mi cuenta y perfil en la plataforma comunitaria La Reliquia Trabaja.{' '}
                  <button type="button" onClick={onOpenPolicy} className="underline font-bold text-blue-900">
                    Leer polÃ­tica
                  </button>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-sm transition-all mt-4 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' && 'Entrar a mi Cuenta'}
              {mode === 'register' && 'Completar Registro'}
              {mode === 'recover' && 'Enviar enlace de recuperaciÃ³n'}
              {mode === 'reset' && 'Guardar contraseÃ±a nueva'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface HomeViewProps {
  approvedProfiles: Profile[];
  portfolioItems: PortfolioItem[];
  jobPostings: JobPosting[];
  categoryStats: Record<string, { workers: number; jobs: number }>;
  globalSearch: string;
  setGlobalSearch: Dispatch<SetStateAction<string>>;
  onHeroSearch: (e: FormEvent) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (tab: TabId) => void;
  onOpenWorker: (profile: Profile) => void;
  onOpenJob: (job: JobPosting) => void;
  onOpenNewJob: () => void;
  onOpenRegister: () => void;
  onOpenPolicy: () => void;
  getCategoryInfo: (categoryId: string) => CategoryInfo;
}

interface DirectoryViewProps {
  filteredProfiles: Profile[];
  portfolioItems: PortfolioItem[];
  dirSearch: string;
  setDirSearch: Dispatch<SetStateAction<string>>;
  dirCategory: string;
  setDirCategory: Dispatch<SetStateAction<string>>;
  dirSector: string;
  setDirSector: Dispatch<SetStateAction<string>>;
  dirAvailability: string;
  setDirAvailability: Dispatch<SetStateAction<string>>;
  dirOnlyWithPhotos: boolean;
  setDirOnlyWithPhotos: Dispatch<SetStateAction<boolean>>;
  onOpenWorker: (profile: Profile) => void;
  onContactWhatsapp: (profile: Profile) => void;
  onNavigate: () => void;
  getCategoryInfo: (categoryId: string) => CategoryInfo;
}

interface JobsBoardViewProps {
  filteredJobs: JobPosting[];
  jobSearch: string;
  setJobSearch: Dispatch<SetStateAction<string>>;
  jobCategory: string;
  setJobCategory: Dispatch<SetStateAction<string>>;
  jobTypeFilter: string;
  setJobTypeFilter: Dispatch<SetStateAction<string>>;
  jobModalityFilter: string;
  setJobModalityFilter: Dispatch<SetStateAction<string>>;
  jobShowClosed: boolean;
  setJobShowClosed: Dispatch<SetStateAction<boolean>>;
  onOpenJob: (job: JobPosting) => void;
  onOpenNewJob: () => void;
  onEditJob: (job: JobPosting) => void;
  currentUserId: string | null;
  isAdmin: boolean;
  getCategoryInfo: (categoryId: string) => CategoryInfo;
}

interface AdminDashboardViewProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  profiles: Profile[];
  portfolioItems: PortfolioItem[];
  jobPostings: JobPosting[];
  reports: Report[];
  adminLogs: AdminLog[];
  onOpenLogin: () => void;
  onOpenWorker: (profile: Profile) => void;
  onOpenJob: (job: JobPosting) => void;
  onLoadDemo: () => Promise<void>;
  onRemoveDemo: () => Promise<void>;
  onUpdateProfileStatus: (profile: Profile, status: ProfileStatus) => Promise<void>;
  onToggleProfileVerify: (profile: Profile) => Promise<void>;
  onDeleteProfile: (profile: Profile) => void;
  onSetPortfolioStatus: (item: PortfolioItem, status: 'approved' | 'flagged') => Promise<void>;
  onDeletePortfolio: (item: PortfolioItem) => Promise<void>;
  onToggleJobStatus: (job: JobPosting) => Promise<void>;
  onDeleteJob: (job: JobPosting) => Promise<void>;
  onSetReportStatus: (report: Report, status: ReportStatus) => Promise<void>;
}

interface WorkerProfileModalProps {
  worker: Profile;
  portfolio: PortfolioItem[];
  categoryInfo: CategoryInfo;
  onClose: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
  onContactWhatsapp: (profile: Profile) => void;
  onReport: (profile: Profile) => void;
}

interface WhatsappContactModalProps {
  worker: Profile;
  onClose: () => void;
}

interface JobDetailModalProps {
  job: JobPosting;
  categoryInfo: CategoryInfo;
  currentUser: SessionUser | null;
  isAdmin: boolean;
  prefillName: string;
  prefillPhone: string;
  applications: JobApplication[];
  showToast: ShowToast;
  onClose: () => void;
  onRequireLogin: () => void;
  onEditJob: (job: JobPosting) => void;
  onReport: (job: JobPosting) => void;
  onApplyJob: (input: ApplicationInput) => Promise<boolean>;
}

interface JobFormModalProps {
  editingJob: JobPosting | null;
  showToast: ShowToast;
  onClose: () => void;
  onSaveJob: (editingId: string | null, input: JobInput) => Promise<boolean>;
  onDeleteJob: (job: JobPosting) => Promise<boolean>;
}

interface ReportModalProps {
  reportData: ReportTarget;
  showToast: ShowToast;
  onClose: () => void;
  onSubmitReport: (input: ReportInput) => Promise<boolean>;
}

interface AuthAccountModalProps {
  mode: AuthMode;
  setMode: Dispatch<SetStateAction<AuthMode>>;
  hint?: string;
  showToast: ShowToast;
  onOpenPolicy: () => void;
  onAuthenticated: (goToPanel: boolean) => void;
  onClose: () => void;
}
