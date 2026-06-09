import {
  archiveProgram,
  assignCoachToStudent,
  assignFitnessToStudent,
  assignParentToStudent,
  assignProgramToStudent,
  assignRole,
  createBasicUser,
  createProgram,
  updateProgram
} from "@/features/admin/actions";
import type { AdminProgram, AdminUserOption } from "@/features/admin/queries";
import type { AppRole, RecordStatus } from "@/lib/db/types";

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

const ROLE_OPTIONS: Array<{ value: AppRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "coach", label: "Coach" },
  { value: "parent", label: "Parent" },
  { value: "fitness_pt", label: "Fitness/PT" },
  { value: "admin", label: "Admin" }
];
const STATUS_OPTIONS: Array<{ value: RecordStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" }
];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function UserSelect({
  label,
  name,
  options
}: {
  label: string;
  name: string;
  options: AdminUserOption[];
}) {
  return (
    <div>
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <select className={inputClassName} id={name} name={name} required>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CreateUserForm() {
  return (
    <form action={createBasicUser} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor="firstName">
            First name
          </label>
          <input
            className={inputClassName}
            id="firstName"
            name="firstName"
            required
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="lastName">
            Last name
          </label>
          <input
            className={inputClassName}
            id="lastName"
            name="lastName"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor="email">
            Email
          </label>
          <input
            className={inputClassName}
            id="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="phone">
            Phone
          </label>
          <input className={inputClassName} id="phone" name="phone" type="tel" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor="password">
            Temporary password
          </label>
          <input
            className={inputClassName}
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="role">
            Initial role
          </label>
          <select className={inputClassName} id="role" name="role">
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Create user
      </button>
    </form>
  );
}

export function AssignRoleForm({ users }: { users: AdminUserOption[] }) {
  return (
    <form
      action={assignRole}
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
    >
      <UserSelect label="User" name="userId" options={users} />
      <div>
        <label className={labelClassName} htmlFor="assignRole">
          Role
        </label>
        <select className={inputClassName} id="assignRole" name="role">
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Assign role
      </button>
    </form>
  );
}

export function ProgramForm({ program }: { program?: AdminProgram }) {
  const isEditing = Boolean(program);

  return (
    <form
      action={isEditing ? updateProgram : createProgram}
      className="grid gap-4"
    >
      {program ? (
        <input name="programId" type="hidden" value={program.id} />
      ) : null}
      <div>
        <label
          className={labelClassName}
          htmlFor={`${program?.id ?? "new"}-name`}
        >
          Program name
        </label>
        <input
          className={inputClassName}
          defaultValue={program?.name}
          id={`${program?.id ?? "new"}-name`}
          name="name"
          required
        />
      </div>
      <div>
        <label
          className={labelClassName}
          htmlFor={`${program?.id ?? "new"}-description`}
        >
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-20`}
          defaultValue={program?.description ?? ""}
          id={`${program?.id ?? "new"}-description`}
          name="description"
        />
      </div>
      <div>
        <label
          className={labelClassName}
          htmlFor={`${program?.id ?? "new"}-status`}
        >
          Status
        </label>
        <select
          className={inputClassName}
          defaultValue={program?.status ?? "active"}
          id={`${program?.id ?? "new"}-status`}
          name="status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        {isEditing ? "Save program" : "Create program"}
      </button>
    </form>
  );
}

export function ArchiveProgramForm({ programId }: { programId: string }) {
  return (
    <form action={archiveProgram}>
      <input name="programId" type="hidden" value={programId} />
      <button
        className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
        type="submit"
      >
        Archive
      </button>
    </form>
  );
}

export function CoachAssignmentForm({
  students,
  coaches
}: {
  students: AdminUserOption[];
  coaches: AdminUserOption[];
}) {
  return (
    <form action={assignCoachToStudent} className="grid gap-4">
      <UserSelect label="Coach" name="coachUserId" options={coaches} />
      <UserSelect label="Student" name="studentUserId" options={students} />
      <AssignmentDates />
      <label className="flex items-center gap-2 text-sm font-medium text-dogwood-ink">
        <input defaultChecked name="isPrimary" type="checkbox" />
        Primary coach
      </label>
      <SubmitButton label="Assign coach" />
    </form>
  );
}

export function ParentAssignmentForm({
  students,
  parents
}: {
  students: AdminUserOption[];
  parents: AdminUserOption[];
}) {
  return (
    <form action={assignParentToStudent} className="grid gap-4">
      <UserSelect label="Parent" name="parentUserId" options={parents} />
      <UserSelect label="Student" name="studentUserId" options={students} />
      <div>
        <label className={labelClassName} htmlFor="relationship">
          Relationship
        </label>
        <input
          className={inputClassName}
          id="relationship"
          name="relationship"
          placeholder="Parent, guardian, grandparent"
        />
      </div>
      <SubmitButton label="Assign parent" />
    </form>
  );
}

export function FitnessAssignmentForm({
  students,
  fitnessUsers
}: {
  students: AdminUserOption[];
  fitnessUsers: AdminUserOption[];
}) {
  return (
    <form action={assignFitnessToStudent} className="grid gap-4">
      <UserSelect
        label="Fitness/PT"
        name="fitnessUserId"
        options={fitnessUsers}
      />
      <UserSelect label="Student" name="studentUserId" options={students} />
      <AssignmentDates />
      <SubmitButton label="Assign Fitness/PT" />
    </form>
  );
}

export function ProgramAssignmentForm({
  students,
  programs
}: {
  students: AdminUserOption[];
  programs: AdminProgram[];
}) {
  return (
    <form action={assignProgramToStudent} className="grid gap-4">
      <UserSelect label="Student" name="studentUserId" options={students} />
      <div>
        <label className={labelClassName} htmlFor="programId">
          Program
        </label>
        <select
          className={inputClassName}
          id="programId"
          name="programId"
          required
        >
          <option value="">Select program</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>
      <AssignmentDates />
      <SubmitButton label="Assign program" />
    </form>
  );
}

function AssignmentDates() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className={labelClassName} htmlFor="startDate">
          Start date
        </label>
        <input
          className={inputClassName}
          defaultValue={todayDate()}
          id="startDate"
          name="startDate"
          required
          type="date"
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="endDate">
          End date
        </label>
        <input
          className={inputClassName}
          id="endDate"
          name="endDate"
          type="date"
        />
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
      type="submit"
    >
      {label}
    </button>
  );
}
