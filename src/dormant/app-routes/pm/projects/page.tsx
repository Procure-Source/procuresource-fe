"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Plus, FolderOpen, MapPin, Clock,
  FileText, Users, ChevronRight, Building2,
  Archive, CheckCircle2, Briefcase
} from "lucide-react";
import Link from "next/link";
import { friendlyError } from "@/lib/friendly-error";

const PROJECT_TYPES = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "industrial", label: "Industrial" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "hospitality", label: "Hospitality" },
  { value: "healthcare", label: "Healthcare" },
];

export default function PMProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    project_type: "",
    description: "",
  });

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Failed to load projects");
    }
    setLoading(false);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: newProject.name,
          location: newProject.location || null,
          projectType: newProject.project_type || null,
          description: newProject.description || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to create project"));
      } else {
        toast.success("Project created successfully");
        setNewProject({ name: "", location: "", project_type: "", description: "" });
        setIsCreating(false);
        fetchProjects();
      }
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to create project"));
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "active": return <Clock className="w-4 h-4 text-blue-500" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "archived": return <Archive className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <PageLayout title="My Projects" subtitle="Manage your procurement projects">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Projects" subtitle="Manage your procurement projects" backButtonHref="/pm/dashboard">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-[#86868b] text-sm">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Create Project Form */}
        {isCreating && (
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g., Al Barsha Tower HVAC"
                    className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Location</label>
                  <input
                    type="text"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="e.g., Dubai, UAE"
                    className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Project Type</label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] bg-white"
                  >
                    <option value="">Select type...</option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description of the project scope..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 text-sm font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#d2d2d7]/30">
            <FolderOpen className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
            <p className="text-[#1d1d1f] font-medium">No projects yet</p>
            <p className="text-[#86868b] text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project._id || project.id}
                href={`/pm/projects/${project._id || project.id}`}
                className="block bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm hover:shadow-md hover:border-[#0066cc]/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-[#0066cc]" />
                      <h3 className="text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                        {project.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#f5f5f7] rounded-full font-medium capitalize">
                        {statusIcon(project.status)}
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-[#86868b] text-sm mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#86868b]">
                      {project.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {project.location}
                        </span>
                      )}
                      {(project.projectType || project.project_type) && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {project.projectType || project.project_type}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {project.projectDocuments?.length || project.project_documents?.length || 0} docs
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {project.projectSuppliers?.length || project.project_suppliers?.length || 0} suppliers
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {project.rfqs?.length || 0} RFQs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#d2d2d7] group-hover:text-[#0066cc] transition-colors mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
