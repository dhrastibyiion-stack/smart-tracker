import { useState, useMemo, Formevent } from "react";
import DatePicker from "react-datepicker";
import { useLeaveRequests } from "../../context/leaveRequests";
import { useAuth } from "../../context/auth";
import { useMembers } from "../../context/members";
import "./LeaveRequestPage.css";
import "react-datepicker/dist/react-datepicker.css";

type LeaveRequestState = {
  employeeName: string;
  leaveType: "Casual" | "Sick" | "UnPaid";
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
};

const emptyLeaveRequest: LeaveRequestState = {
  employeeName: "",
  leaveType: "Casual",
  startDate: null,
  endDate: null,
  reason: "",
};

const LeaveRequestPage = () => {
  const { leaveRequests, createLeaveRequest, isLoading } = useLeaveRequests();
  const { user } = useAuth();
  const { members } = useMembers();

  const [form, setForm] = useState<LeaveRequestState>(emptyLeaveRequest);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const developers = useMemo(() => members.filter((m) => m.role === "dev"), [members]);

  const [filterEmployeeName, setFilterEmployeeName] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [filterFromDate, setFilterFromDate] = useState<Date | null>(null);
  const [filterToDate, setFilterToDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const leaveDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const from = form.startDate;
    const to = form.endDate;
    const diffMs = to.getTime() - from.getTime();
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }, [form.startDate, form.endDate]);

  const formatDate = (date: Date | null) => (date ? date.toISOString().split("T")[0] : "");

  const formatDateDisplay = (value: string) => {
    if (!value) return "";
    return value.split("T")[0];
  };

  const badgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "leave-badge leave-badge-pending";
      case "Approved":
        return "leave-badge leave-badge-approved";
      case "Rejected":
        return "leave-badge leave-badge-rejected";
      default:
        return "leave-badge";
    }
  };

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      if (filterEmployeeNam e && req.requesterName !== filterEmployeeName) return false;
      if (filterLeaveType && req.leaveType !== filterLeaveType) return false;
      if (filterStatus && req.status !== filterStatus) return false;
      if (filterFromDate && req.startDate < formatDateDisplay(filterFromDate.toISOString()))
        return false;
      if (filterToDate && req.endDate > formatDateDisplay(filterToDate.toISOString())) return false;
      return true;
    });
  }, [
    leaveRequests,
    filterEmployeeName,
    filterLeaveType,
    filterFromDate,
    filterToDate,
    filterStatus,
  ]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.employeeName.trim()) nextErrors.employeeName = "Employee name is required.";
    if (!form.leaveType) nextErrors.leaveType = "Leave type is required.";
    if (!form.startDate) nextErrors.startDate = "Start date is required.";
    if (!form.endDate) nextErrors.endDate = "End date is required.";
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      nextErrors.endDate = "From date must not be after To date.";
    if (!form.reason.trim()) nextErrors.reason = "Reason is required.";
    else if (form.reason.trim().length < 20)
      nextErrors.reason = `Reason must be at least 20 characters (${form.reason.trim().length}/20).`;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage(null);
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    try {
      await createLeaveRequest({
        requesterId: Date.now(),
        requesterName: form.employeeName.trim(),
        leaveType: form.leaveType,
        days: leaveDays || 1,
        reason: form.reason.trim(),
        startDate: formatDate(form.startDate),
        endDate: formatDate(form.endDate),
        companyId: user?.companyId,
      });

      setForm(emptyLeaveRequest);
      setErrors({});
      setSuccessMessage("Leave request submitted successfully.");
    } catch {
      setErrors({ form: "Failed to submit leave request." });
    }
  };

  return (
    <div className="leave-page">
      <header className="leave-header">
        <h1>Leave Request</h1>
        <p>Submit your leave request and track its status.</p>
      </header>

      <section className="leave-section">
        <h2>New Request</h2>

        {successMessage && <div className="leave-message leave-message-success">{successMessage}</div>}
        {errors.form && <div className="leave-message leave-message-error">{errors.form}</div>}

        <form className="leave-form" onSubmit={handleSubmit}>
          <div className="leave-form-row">
            <div className="leave-field">
              <label htmlFor="employeeName">Employee Name</label>
              <select
                id="employeeName"
                name="employeeName"
                className={`leave-input${errors.employeeName ? " leave-input-error" : ""}`}
                value={form.employeeName}
                onChange={handleChange}
              >
                <option value="">Select Developer</option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.name}>
                    {dev.name}
                  </option>
                ))}
              </select>
              {errors.employeeName && <span className="leave-error">{errors.employeeName}</span>}
            </div>

            <div className="leave-field">
              <label htmlFor="leaveType">Leave Type</label>
              <select
                id="leaveType"
                name="leaveType"
                className={`leave-input${errors.leaveType ? " leave-input-error" : ""}`}
                value={form.leaveType}
                onChange={handleChange}
              >
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="UnPaid">UnPaid</option>
              </select>
              {errors.leaveType && <span className="leave-error">{errors.leaveType}</span>}
            </div>
          </div>

          <div className="leave-form-row">
            <div className="leave-field">
              <label htmlFor="startDate">From Date</label>
              <DatePicker
                id="startDate"
                selected={form.startDate}
                onChange={(date) =>
                  handleChange({ target: { name: "startDate", value: date } } as React.ChangeEvent<HTMLInputElement>)
                }
                className={`leave-input${errors.startDate ? " leave-input-error" : ""}`}
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yyyy"
              />
              {errors.startDate && <span className="leave-error">{errors.startDate}</span>}
            </div>

            <div className="leave-field">
              <label htmlFor="endDate">To Date</label>
              <DatePicker
                id="endDate"
                selected={form.endDate}
                onChange={(date) =>
                  handleChange({ target: { name: "endDate", value: date } } as React.ChangeEvent<HTMLInputElement>)
                }
                className={`leave-input${errors.endDate ? " leave-input-error" : ""}`}
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yyyy"
              />
              {errors.endDate && <span className="leave-error">{errors.endDate}</span>}
            </div>

            <div className="leave-field leave-days-field">
              <span className="leave-days-label">Leave Days</span>
              <span className="leave-days-value">{leaveDays}</span>
            </div>
          </div>

          <div className="leave-field">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              className={`leave-input leave-textarea${errors.reason ? " leave-input-error" : ""}`}
              placeholder="Explain the reason for leave (min. 20 characters)"
              value={form.reason}
              onChange={handleChange}
            />
            {errors.reason && <span className="leave-error">{errors.reason}</span>}
          </div>

          <div className="leave-form-actions">
            <button type="submit" className="leave-btn leave-btn-primary" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </section>

      <section className="leave-section">
        <h2>Leave History</h2>

        <div className="leave-filter-bar">
          <div className="leave-form-row">
            <div className="leave-field">
              <label htmlFor="filterEmployeeName">Employee Name</label>
              <select
                id="filterEmployeeName"
                name="filterEmployeeName"
                className="leave-input"
                value={filterEmployeeName}
                onChange={(e) => setFilterEmployeeName(e.target.value)}
              >
                <option value="">All Employees</option>
                {Array.from(new Set(leaveRequests.map((req) => req.requesterName))).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="leave-field">
              <label htmlFor="filterLeaveType">Leave Type</label>
              <select
                id="filterLeaveType"
                name="filterLeaveType"
                className="leave-input"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="UnPaid">UnPaid</option>
              </select>
            </div>

            <div className="leave-field">
              <label htmlFor="filterStatus">Status</label>
              <select
                id="filterStatus"
                name="filterStatus"
                className="leave-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="leave-form-row">
            <div className="leave-field">
              <label htmlFor="filterFromDate">From Date</label>
              <DatePicker
                id="filterFromDate"
                selected={filterFromDate}
                onChange={(date) => setFilterFromDate(date)}
                className="leave-input"
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yyyy"
                isClearable
                allowSameDay
              />
            </div>

            <div className="leave-field">
              <label htmlFor="filterToDate">To Date</label>
              <DatePicker
                id="filterToDate"
                selected={filterToDate}
                onChange={(date) => setFilterToDate(date)}
                className="leave-input"
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yyyy"
                isClearable
                allowSameDay
              />
            </div>

            <div className="leave-field" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="leave-btn leave-btn-secondary"
                onClick={() => {
                  setFilterEmployeeName("");
                  setFilterLeaveType("");
                  setFilterFromDate(null);
                  setFilterToDate(null);
                  setFilterStatus("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="leave-empty">No leave requests match the selected filters.</div>
        ) : (
          <div className="leave-history-grid">
            {filteredRequests.map((req) => (
              <div key={req.id} className="leave-history-card">
                <div className="leave-history-header">
                  <h3 className="leave-history-name">{req.requesterName}</h3>
                  <span className={badgeClass(req.status)}>{req.status}</span>
                </div>
                <div className="leave-history-meta">
                  <span>{req.leaveType}</span>
                  <span className="leave-divider">|</span>
                  <span>
                    {formatDateDisplay(req.startDate)} - {formatDateDisplay(req.endDate)}
                  </span>
                  <span className="leave-divider">|</span>
                  <span>
                    {req.days} day{req.days === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="leave-history-reason">{req.reason}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LeaveRequestPage;
