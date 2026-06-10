import { Suspense, useContext } from "react";

import "./App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeContext } from "./theme/ThemeContext";

import { ProjectsProvider } from "./context/projects";
import { MembersProvider } from "./context/members";
import { AuthProvider } from "./context/auth";
import { TasksProvider } from "./context/tasks";
import { LeaveRequestsProvider } from "./context/leaveRequests";
import { CommentsProvider } from "./context/comments";
import { TimeTrackingProvider } from "./context/timeTracking";

import ProtectedRoute from "./ProtectedRoute";
import Signin from "./pages/Signin";
import HomePage from "./pages/HomePage";
import Notfound from "./pages/Notfound";
import TrashPage from "./pages/TrashPage";

import AdminDashboard from "./pages/AdminDashboard";
import SetPassword from "./pages/SetPassword";
import ProjectManagerDashboard from "./pages/dashboards/ProjectManagerDashboard";
import DeveloperDashboard from "./pages/dashboards/DeveloperDashboard";

const App = () => {
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme ?? "light";

return (
    <div className={theme === "dark" ? "dark" : ""}>
       <AuthProvider>
          <TasksProvider>
            <LeaveRequestsProvider>
              <CommentsProvider>
                <TimeTrackingProvider>
                  <ProjectsProvider>
                    <MembersProvider>
                      <Suspense fallback={<>Loading...</>}>
                        <BrowserRouter>
                          <Routes>
                            <Route path="/login" element={<Signin />} />

                            <Route element={<ProtectedRoute roles={["admin"]} />}>
                              <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute
                                  roles={["projectManager", "admin"]}
                                />
                              }
                            >
                              <Route
                                path="/pm-dashboard"
                                element={<ProjectManagerDashboard />}
                              />
                            </Route>

 <Route element={<ProtectedRoute roles={["dev", "admin"]} />}>
                              <Route path="/dev-dashboard" element={<DeveloperDashboard />} />
                            </Route>

 <Route path="/trash" element={<TrashPage />} />

                            <Route path="/" element={<HomePage />} />
                            <Route path="/signin" element={<Signin />} />
                            <Route path="/set-password/:token" element={<SetPassword />} />
                            <Route path="/notfound" element={<Notfound />} />

                            <Route path="*" element={<Navigate to="/signin" replace />} />
                          </Routes>
                        </BrowserRouter>
                      </Suspense>
                    </MembersProvider>
                  </ProjectsProvider>
                </TimeTrackingProvider>
              </CommentsProvider>
            </LeaveRequestsProvider>
          </TasksProvider>
        </AuthProvider>
     </div>
   );
 };

export default App;