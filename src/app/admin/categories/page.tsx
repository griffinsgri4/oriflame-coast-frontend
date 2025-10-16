"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

type FormState = {
  name: string;
  slug?: string;
  order?: number;
  thumbnail_url?: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", order: 0, thumbnail_url: "" });
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [createUploadError, setCreateUploadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [period, setPeriod] = useState<'30d' | '90d' | 'all'>('90d');
  const [topCats, setTopCats] = useState<Array<{ name: string; slug: string; sales_count: number; product_count: number; thumbnail_url?: string }>>([]);

  const totalProducts = useMemo(() => categories.reduce((acc, c) => acc + (c.product_count || 0), 0), [categories]);
  const totalSales = useMemo(() => categories.reduce((acc, c) => acc + (c.sales_count || 0), 0), [categories]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.categories.getAll({ sort: "order_asc" });
      const payload = res as any;
      const data: Category[] = Array.isArray(payload.data) ? payload.data : payload.data?.data || [];
      setCategories(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Client-side admin guard
    (async () => {
      try {
        const res = await api.auth.getUser();
        const user = (res as any).data as any;
        const admin = user?.role === 'admin';
        setIsAdmin(admin);
        if (!admin && typeof window !== 'undefined') {
          window.location.href = '/login';
          return;
        }
      } catch (e) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
          return;
        }
      } finally {
        setAuthLoading(false);
      }
      fetchData();
    })();
  }, []);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await api.analytics.topCategories({ period, limit: 8 });
        const payload = res as any;
        const data = Array.isArray(payload.data) ? payload.data : payload.data?.data || [];
        setTopCats(data as any);
      } catch (e) {
        // Non-blocking
      }
    };
    if (isAdmin) fetchTop();
  }, [period, isAdmin]);

  const onCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await api.categories.create({
        name: form.name,
        slug: form.slug,
        order: form.order,
        thumbnail_url: form.thumbnail_url,
      });
      const created = (res as any).data as Category;
      if (createFile && created?.id) {
        try {
          const uploadRes = await api.categories.uploadThumbnail(Number(created.id), createFile);
          const updated = (uploadRes as any).data as Category;
          setCategories((prev) => [...prev, updated]);
        } catch (err: any) {
          setCreateUploadError(err?.response?.data?.message || err?.message || 'Upload failed');
          setCategories((prev) => [...prev, created]);
        }
      } else {
        setCategories((prev) => [...prev, created]);
      }
      setForm({ name: "", order: 0, thumbnail_url: "" });
      setCreateFile(null);
      setCreatePreview(null);
      setCreateUploadError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const onUpdate = async (id: number, data: Partial<Category>) => {
    setSavingId(id);
    setError(null);
    try {
      const res = await api.categories.update(id, {
        name: data.name,
        slug: data.slug,
        order: data.order,
        thumbnail_url: data.thumbnail_url,
        meta: data.meta as any,
      });
      const updated = (res as any).data as Category;
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    setSavingId(id);
    setError(null);
    try {
      await api.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete category");
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading) {
    return <div className="p-6">Checking access...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Categories</h1>
          <p className="text-sm text-muted-foreground">Manage names, order, and thumbnails. Sales and product counts are aggregated.</p>
        </div>
        {/* Drag-and-drop thumbnail upload */}
        <div
          className={`mt-3 border-2 border-dashed rounded-lg p-4 text-sm flex items-center gap-3 ${dragOver ? 'border-black bg-gray-50' : 'border-gray-300'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            const validType = /image\/(jpg|jpeg|png|webp)/.test(file.type);
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (!validType) {
              setCreateUploadError('Invalid image type. Use JPG, PNG, or WEBP.');
              return;
            }
            if (file.size > maxSize) {
              setCreateUploadError('Image too large. Max size is 5MB.');
              return;
            }
            setCreateUploadError(null);
            setCreateFile(file);
            setCreatePreview(URL.createObjectURL(file));
          }}
        >
          <div className="flex-1">
            <div className="font-medium">Thumbnail</div>
            <div className="text-muted-foreground">Drag an image here or select a file.</div>
            <input
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                const validType = /image\/(jpg|jpeg|png|webp)/.test(file.type);
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (!validType) {
                  setCreateUploadError('Invalid image type. Use JPG, PNG, or WEBP.');
                  return;
                }
                if (file.size > maxSize) {
                  setCreateUploadError('Image too large. Max size is 5MB.');
                  return;
                }
                setCreateUploadError(null);
                setCreateFile(file);
                setCreatePreview(URL.createObjectURL(file));
              }}
            />
            {createUploadError && (
              <div className="mt-2 text-red-600">{createUploadError}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {createPreview ? (
              <Image src={createPreview} alt="Preview" width={56} height={56} className="rounded object-cover" />
            ) : (
              <div className="w-14 h-14 rounded bg-gray-200" />
            )}
            {createFile && (
              <button
                type="button"
                className="px-2 py-1 rounded bg-gray-800 text-white"
                onClick={() => { setCreateFile(null); setCreatePreview(null); setCreateUploadError(null); }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="text-sm">
          <span className="mr-4">Products: {totalProducts}</span>
          <span>Sales: {totalSales}</span>
        </div>
      </div>

      {/* Trends */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Top Categories · Trends</h2>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="30d">Last 30d</option>
            <option value="90d">Last 90d</option>
            <option value="all">All time</option>
          </select>
        </div>
        {topCats.length === 0 ? (
          <div className="text-sm text-muted-foreground">No trend data yet</div>
        ) : (
          <div className="space-y-2">
            {(() => {
              const max = Math.max(...topCats.map((t) => t.sales_count || 0), 1);
              return topCats.map((t) => (
                <div key={t.slug} className="flex items-center gap-3">
                  {t.thumbnail_url ? (
                    <Image src={t.thumbnail_url} alt={t.name} width={28} height={28} className="rounded object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded bg-gray-200" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground">{t.sales_count} sales</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 rounded bg-black"
                        style={{ width: `${Math.round(((t.sales_count || 0) / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Create form */}
      <div className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Create Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Slug (optional)"
            value={form.slug || ''}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Order"
            type="number"
            value={form.order ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Thumbnail URL"
            value={form.thumbnail_url || ''}
            onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
          />
        </div>
        <div className="mt-3">
          <button
            onClick={onCreate}
            disabled={creating || !form.name}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          {error && <span className="ml-3 text-red-600 text-sm">{error}</span>}
        </div>
      </div>

      {/* List and inline edit */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Thumbnail</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Products</th>
              <th className="text-left p-3">Sales</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">Loading...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">No categories yet</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id ?? c.slug} className="border-t">
                  <td className="p-3">
                    {c.thumbnail_url ? (
                      <Image src={c.thumbnail_url} alt={c.name} width={48} height={48} className="rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200" />
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      defaultValue={c.name}
                      onBlur={(e) => onUpdate(c.id!, { name: e.target.value })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      defaultValue={c.slug}
                      onBlur={(e) => onUpdate(c.id!, { slug: e.target.value })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-24"
                      type="number"
                      defaultValue={c.order ?? 0}
                      onBlur={(e) => onUpdate(c.id!, { order: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-3">{c.product_count ?? 0}</td>
                  <td className="p-3">{c.sales_count ?? 0}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1"
                        defaultValue={c.thumbnail_url || ''}
                        placeholder="Thumbnail URL"
                        onBlur={(e) => onUpdate(c.id!, { thumbnail_url: e.target.value })}
                      />
                      <label className="px-3 py-1 rounded bg-gray-800 text-white cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && c.id) {
                              setSavingId(c.id as number);
                              try {
                                const res = await api.categories.uploadThumbnail(Number(c.id), file);
                                const updated = (res as any).data as Category;
                                setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)));
                              } catch (err: any) {
                                setError(err?.response?.data?.message || err?.message || 'Upload failed');
                              } finally {
                                setSavingId(null);
                              }
                            }
                          }}
                        />
                      </label>
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                        disabled={savingId === c.id}
                        onClick={() => onDelete(c.id!)}
                      >
                        {savingId === c.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}