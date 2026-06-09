export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "coach" | "student" | "parent" | "fitness_pt";
export type RecordStatus = "active" | "inactive" | "archived";
export type VisibilityLevel = "internal" | "staff" | "student_parent" | "private";
export type GoalStatus = "active" | "completed" | "paused" | "archived";
export type PlanStatus = "draft" | "active" | "completed" | "archived";
export type LessonNoteStatus = "draft" | "published" | "archived";
export type AssessmentStatus = "draft" | "published" | "archived";
export type ProgressMetricStatus = "draft" | "published" | "archived";
export type AssetStatus = "draft" | "published" | "archived";
export type AssessmentType =
  | "trackman_combine"
  | "upgame_assessment"
  | "wedge_test"
  | "putting_test"
  | "speed_test"
  | "skills_assessment"
  | "movement_screen"
  | "fitness_assessment"
  | "other";
export type MetricCategory =
  | "swing"
  | "scoring"
  | "skills"
  | "putting"
  | "wedge"
  | "speed"
  | "fitness"
  | "practice"
  | "custom";
export type PriorityLevel = "low" | "medium" | "high";
export type WorkoutCompletionState =
  | "not_started"
  | "in_progress"
  | "completed"
  | "missed";
export type TournamentStatus = "upcoming" | "completed" | "cancelled";
export type TournamentResultStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "archived";
export type TemplateStatus = "draft" | "active" | "archived";
export type TemplateItemType =
  | "development_priority"
  | "assessment"
  | "practice_plan"
  | "goal"
  | "workout_assignment";

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Array<{
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }>;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<{
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
        status: RecordStatus;
        created_at: string;
        updated_at: string;
        last_login_at: string | null;
      }>;
      roles: TableDefinition<{
        id: string;
        name: AppRole;
        description: string | null;
      }>;
      user_roles: TableDefinition<
        {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        }
      >;
      student_profiles: TableDefinition<{
        id: string;
        user_id: string;
        date_of_birth: string | null;
        junior_player: boolean;
        handedness: string | null;
        graduation_year: number | null;
        school: string | null;
        goals_summary: string | null;
        notes_summary: string | null;
        status: RecordStatus;
        created_at: string;
        updated_at: string;
      }>;
      coach_profiles: TableDefinition<
        {
          id: string;
          user_id: string;
          bio: string | null;
          specialties: string[] | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          bio?: string | null;
          specialties?: string[] | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          bio?: string | null;
          specialties?: string[] | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      fitness_profiles: TableDefinition<
        {
          id: string;
          user_id: string;
          credentials: string | null;
          specialties: string[] | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          credentials?: string | null;
          specialties?: string[] | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          credentials?: string | null;
          specialties?: string[] | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      parent_student_links: TableDefinition<
        {
          id: string;
          parent_user_id: string;
          student_user_id: string;
          relationship: string | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          parent_user_id: string;
          student_user_id: string;
          relationship?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          parent_user_id?: string;
          student_user_id?: string;
          relationship?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      coach_student_assignments: TableDefinition<
        {
          id: string;
          coach_user_id: string;
          student_user_id: string;
          is_primary: boolean;
          start_date: string;
          end_date: string | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          coach_user_id: string;
          student_user_id: string;
          is_primary?: boolean;
          start_date?: string;
          end_date?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          coach_user_id?: string;
          student_user_id?: string;
          is_primary?: boolean;
          start_date?: string;
          end_date?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      fitness_student_assignments: TableDefinition<
        {
          id: string;
          fitness_user_id: string;
          student_user_id: string;
          start_date: string;
          end_date: string | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          fitness_user_id: string;
          student_user_id: string;
          start_date?: string;
          end_date?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          fitness_user_id?: string;
          student_user_id?: string;
          start_date?: string;
          end_date?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      programs: TableDefinition<{
        id: string;
        name: string;
        description: string | null;
        default_program_template_id: string | null;
        status: RecordStatus;
        created_at: string;
        updated_at: string;
      }>;
      student_program_enrollments: TableDefinition<{
        id: string;
        student_user_id: string;
        program_id: string;
        program_template_id: string | null;
        template_applied_at: string | null;
        template_applied_by_user_id: string | null;
        start_date: string;
        end_date: string | null;
        status: RecordStatus;
        created_at: string;
        updated_at: string;
      }>;
      development_priorities: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id: string | null;
          source_program_template_item_id: string | null;
          owner_user_id: string | null;
          title: string;
          description: string | null;
          category: string | null;
          priority_level: PriorityLevel;
          target_date: string | null;
          sort_order: number;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title: string;
          description?: string | null;
          category?: string | null;
          priority_level?: PriorityLevel;
          target_date?: string | null;
          sort_order?: number;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string | null;
          priority_level?: PriorityLevel;
          target_date?: string | null;
          sort_order?: number;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      student_goals: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id: string | null;
          source_program_template_item_id: string | null;
          owner_user_id: string | null;
          title: string;
          description: string | null;
          category: string | null;
          status: GoalStatus;
          target_date: string | null;
          progress_value: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title: string;
          description?: string | null;
          category?: string | null;
          status?: GoalStatus;
          target_date?: string | null;
          progress_value?: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string | null;
          status?: GoalStatus;
          target_date?: string | null;
          progress_value?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      practice_plans: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id: string | null;
          source_program_template_item_id: string | null;
          owner_user_id: string | null;
          title: string;
          description: string | null;
          assigned_date: string;
          due_date: string | null;
          status: PlanStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          status?: PlanStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          source_program_template_id?: string | null;
          source_program_template_item_id?: string | null;
          owner_user_id?: string | null;
          title?: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          status?: PlanStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      practice_plan_items: TableDefinition<
        {
          id: string;
          practice_plan_id: string;
          title: string;
          instructions: string | null;
          duration_minutes: number | null;
          frequency: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          practice_plan_id: string;
          title: string;
          instructions?: string | null;
          duration_minutes?: number | null;
          frequency?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          practice_plan_id?: string;
          title?: string;
          instructions?: string | null;
          duration_minutes?: number | null;
          frequency?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      lesson_notes: TableDefinition<
        {
          id: string;
          student_user_id: string;
          coach_user_id: string | null;
          created_by_user_id: string;
          title: string;
          lesson_date: string;
          focus_area: string | null;
          summary: string | null;
          note_body: string | null;
          visibility: VisibilityLevel;
          status: LessonNoteStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          coach_user_id?: string | null;
          created_by_user_id: string;
          title: string;
          lesson_date?: string;
          focus_area?: string | null;
          summary?: string | null;
          note_body?: string | null;
          visibility?: VisibilityLevel;
          status?: LessonNoteStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          coach_user_id?: string | null;
          created_by_user_id?: string;
          title?: string;
          lesson_date?: string;
          focus_area?: string | null;
          summary?: string | null;
          note_body?: string | null;
          visibility?: VisibilityLevel;
          status?: LessonNoteStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      assessments: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          assessment_type: AssessmentType;
          assessment_date: string;
          title: string;
          summary: string | null;
          findings: string | null;
          score: number | null;
          score_unit: string | null;
          visibility: VisibilityLevel;
          status: AssessmentStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          assessment_type: AssessmentType;
          assessment_date?: string;
          title: string;
          summary?: string | null;
          findings?: string | null;
          score?: number | null;
          score_unit?: string | null;
          visibility?: VisibilityLevel;
          status?: AssessmentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          assessment_type?: AssessmentType;
          assessment_date?: string;
          title?: string;
          summary?: string | null;
          findings?: string | null;
          score?: number | null;
          score_unit?: string | null;
          visibility?: VisibilityLevel;
          status?: AssessmentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      progress_metrics: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          metric_name: string;
          category: MetricCategory;
          value: number;
          unit: string | null;
          recorded_at: string;
          notes: string | null;
          visibility: VisibilityLevel;
          status: ProgressMetricStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          metric_name: string;
          category: MetricCategory;
          value: number;
          unit?: string | null;
          recorded_at?: string;
          notes?: string | null;
          visibility?: VisibilityLevel;
          status?: ProgressMetricStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          metric_name?: string;
          category?: MetricCategory;
          value?: number;
          unit?: string | null;
          recorded_at?: string;
          notes?: string | null;
          visibility?: VisibilityLevel;
          status?: ProgressMetricStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      tournament_results: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          event_name: string;
          event_type: string | null;
          start_date: string;
          end_date: string | null;
          course_name: string | null;
          location: string | null;
          score: number | null;
          finish_position: string | null;
          field_size: number | null;
          status: TournamentResultStatus;
          preparation_notes: string | null;
          result_notes: string | null;
          coach_takeaways: string | null;
          visibility: VisibilityLevel;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          event_name: string;
          event_type?: string | null;
          start_date: string;
          end_date?: string | null;
          course_name?: string | null;
          location?: string | null;
          score?: number | null;
          finish_position?: string | null;
          field_size?: number | null;
          status?: TournamentResultStatus;
          preparation_notes?: string | null;
          result_notes?: string | null;
          coach_takeaways?: string | null;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          event_name?: string;
          event_type?: string | null;
          start_date?: string;
          end_date?: string | null;
          course_name?: string | null;
          location?: string | null;
          score?: number | null;
          finish_position?: string | null;
          field_size?: number | null;
          status?: TournamentResultStatus;
          preparation_notes?: string | null;
          result_notes?: string | null;
          coach_takeaways?: string | null;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        }
      >;
      file_assets: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description: string | null;
          category: string;
          visibility: VisibilityLevel;
          status: AssetStatus;
          file_name: string;
          file_type: string | null;
          mime_type: string;
          file_size: number;
          storage_bucket: string;
          storage_key: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          visibility?: VisibilityLevel;
          status?: AssetStatus;
          file_name: string;
          file_type?: string | null;
          mime_type: string;
          file_size: number;
          storage_bucket: string;
          storage_key: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          visibility?: VisibilityLevel;
          status?: AssetStatus;
          file_name?: string;
          file_type?: string | null;
          mime_type?: string;
          file_size?: number;
          storage_bucket?: string;
          storage_key?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      video_assets: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description: string | null;
          category: string;
          visibility: VisibilityLevel;
          status: AssetStatus;
          file_name: string;
          mime_type: string;
          file_size: number;
          storage_bucket: string;
          storage_key: string;
          thumbnail_key: string | null;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          visibility?: VisibilityLevel;
          status?: AssetStatus;
          file_name: string;
          mime_type: string;
          file_size: number;
          storage_bucket: string;
          storage_key: string;
          thumbnail_key?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          visibility?: VisibilityLevel;
          status?: AssetStatus;
          file_name?: string;
          mime_type?: string;
          file_size?: number;
          storage_bucket?: string;
          storage_key?: string;
          thumbnail_key?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      fitness_plans: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description: string | null;
          assigned_date: string;
          due_date: string | null;
          status: PlanStatus;
          visibility: VisibilityLevel;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          status?: PlanStatus;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          title?: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          status?: PlanStatus;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        }
      >;
      workout_assignments: TableDefinition<
        {
          id: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description: string | null;
          assigned_date: string;
          due_date: string | null;
          frequency: string | null;
          status: PlanStatus;
          completion_state: WorkoutCompletionState;
          completed_at: string | null;
          exercise_details: string | null;
          visibility: VisibilityLevel;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_user_id: string;
          created_by_user_id: string;
          title: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          frequency?: string | null;
          status?: PlanStatus;
          completion_state?: WorkoutCompletionState;
          completed_at?: string | null;
          exercise_details?: string | null;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          student_user_id?: string;
          created_by_user_id?: string;
          title?: string;
          description?: string | null;
          assigned_date?: string;
          due_date?: string | null;
          frequency?: string | null;
          status?: PlanStatus;
          completion_state?: WorkoutCompletionState;
          completed_at?: string | null;
          exercise_details?: string | null;
          visibility?: VisibilityLevel;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: {
          role_name: AppRole;
          user_id?: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          user_id?: string;
        };
        Returns: boolean;
      };
      can_view_student: {
        Args: {
          student_id: string;
          user_id?: string;
        };
        Returns: boolean;
      };
      can_view_visible_record: {
        Args: {
          student_id: string;
          visibility: VisibilityLevel;
          user_id?: string;
        };
        Returns: boolean;
      };
      is_assigned_coach: {
        Args: {
          student_id: string;
          user_id?: string;
        };
        Returns: boolean;
      };
      is_assigned_fitness: {
        Args: {
          student_id: string;
          user_id?: string;
        };
        Returns: boolean;
      };
      is_linked_parent: {
        Args: {
          student_id: string;
          user_id?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      record_status: RecordStatus;
      visibility_level: VisibilityLevel;
      goal_status: GoalStatus;
      plan_status: PlanStatus;
      lesson_note_status: LessonNoteStatus;
      assessment_type: AssessmentType;
      assessment_status: AssessmentStatus;
      asset_status: AssetStatus;
      metric_category: MetricCategory;
      progress_metric_status: ProgressMetricStatus;
      priority_level: PriorityLevel;
      workout_completion_state: WorkoutCompletionState;
      tournament_status: TournamentStatus;
      tournament_result_status: TournamentResultStatus;
      template_status: TemplateStatus;
      template_item_type: TemplateItemType;
    };
    CompositeTypes: Record<string, never>;
  };
};
