'use client'

import { useEffect, useMemo, useState } from 'react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string | null
  cover_image: string | null
  published: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
}

const emptyForm = {
  id: '',
  title: '',
  slug: '',
  category: '',
  cover_image: '',
  excerpt: '',
  content: '',
  seo_title: '',
  seo_description: '',
  published: true,
}

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminBlogPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [form, setForm] = useState(emptyForm)
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const isEditing = Boolean(form.id)

  const sortedPosts = useMemo(() => posts || [], [posts])

  async function loadPosts() {
    const response = await fetch('/api/admin/blog', {
      headers: {
        'x-admin-password': password,
      },
    })

    const data = await response.json()

    if (!data.success) {
      alert(data.message || 'Unable to load posts.')
      setAuthorized(false)
      return
    }

    setPosts(data.posts || [])
    setAuthorized(true)
  }

  async function login() {
    if (!password) {
      alert('Enter admin password.')
      return
    }

    await loadPosts()
  }

  function updateField(field: keyof typeof emptyForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setTopic('')
  }

  function editPost(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || '',
      cover_image: post.cover_image || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      published: Boolean(post.published),
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function generateWithAI() {
    try {
      if (!topic) {
        alert('Enter a topic first.')
        return
      }

      setAiLoading(true)

      const response = await fetch('/api/ai/blog-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.message || 'AI generation failed.')
        return
      }

      const article = data.article

      setForm((current) => ({
        ...current,
        id: '',
        title: article.title || '',
        slug: article.slug || makeSlug(article.title || topic),
        category: article.category || '',
        cover_image: article.cover_image || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        published: true,
      }))
    } catch (error) {
      console.error(error)
      alert('Something went wrong while generating.')
    } finally {
      setAiLoading(false)
    }
  }

  async function savePost() {
    try {
      if (!form.title || !form.content) {
        alert('Title and content are required.')
        return
      }

      setLoading(true)

      const payload = {
        ...form,
        slug: form.slug || makeSlug(form.title),
        seo_title: form.seo_title || `${form.title} | 2EZ TEK`,
        seo_description: form.seo_description || form.excerpt,
      }

      const response = await fetch('/api/admin/blog', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.message || 'Save failed.')
        return
      }

      alert(isEditing ? 'Blog post updated.' : 'Blog post published.')

      resetForm()
      await loadPosts()
    } catch (error) {
      console.error(error)
      alert('Something went wrong while saving.')
    } finally {
      setLoading(false)
    }
  }

  async function deletePost(id: string) {
    const confirmed = window.confirm('Delete this blog post? This cannot be undone.')

    if (!confirmed) return

    const response = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ id }),
    })

    const data = await response.json()

    if (!data.success) {
      alert(data.message || 'Delete failed.')
      return
    }

    alert('Blog post deleted.')
    await loadPosts()
  }

  async function togglePublished(post: BlogPost) {
    const response = await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        ...post,
        published: !post.published,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      alert(data.message || 'Update failed.')
      return
    }

    await loadPosts()
  }

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')

    if (saved) {
      setPassword(saved)
    }
  }, [])

  useEffect(() => {
    if (authorized && password) {
      localStorage.setItem('blogAdminPassword', password)
    }
  }, [authorized, password])

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/30 p-8 backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Secure Blog CMS
          </div>

          <h1 className="mt-6 text-4xl font-black">Admin Access</h1>

          <p className="mt-4 text-white/60">
            Enter your blog admin password to manage articles.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-cyan-400"
          />

          <button
            onClick={login}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black"
          >
            Enter Dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
              SmartGymOps AI CMS
            </div>

            <h1 className="mt-6 text-5xl font-black">
              Blog Admin Dashboard
            </h1>

            <p className="mt-4 text-lg text-white/65">
              Generate, publish, edit, unpublish, and delete 2EZ TEK blog articles.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white"
          >
            New Article
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-8 rounded-[2rem] border border-white/10 bg-black/25 p-8 backdrop-blur-2xl">
            <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-6">
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                AI Blog Topic
              </label>

              <div className="flex flex-col gap-4 md:flex-row">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Example: NordicTrack boot loop issues"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />

                <button
                  onClick={generateWithAI}
                  disabled={aiLoading}
                  className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {aiLoading ? 'Generating...' : 'Generate With AI'}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Blog Title
              </label>

              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((current) => ({
                    ...current,
                    title,
                    slug: current.slug || makeSlug(title),
                  }))
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  Category
                </label>

                <input
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Cover Image URL
              </label>

              <input
                value={form.cover_image}
                onChange={(e) => updateField('cover_image', e.target.value)}
                placeholder="/images/gym-equipment-repair-dallas.webp"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Excerpt
              </label>

              <textarea
                value={form.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Article Content
              </label>

              <textarea
                value={form.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={18}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  SEO Title
                </label>

                <input
                  value={form.seo_title}
                  onChange={(e) => updateField('seo_title', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  SEO Description
                </label>

                <input
                  value={form.seo_description}
                  onChange={(e) => updateField('seo_description', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-bold text-white/80">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateField('published', e.target.checked)}
              />
              Published
            </label>

            <button
              onClick={savePost}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Update Article'
                  : 'Publish Article'}
            </button>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-black/25 p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black">Published Articles</h2>

            <div className="mt-6 space-y-4">
              {sortedPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black">{post.title}</div>

                      <div className="mt-2 text-sm text-white/45">
                        /blog/{post.slug}
                      </div>

                      <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                        {post.published ? 'Published' : 'Draft'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => editPost(post)}
                      className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => togglePublished(post)}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>

                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      View
                    </a>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {sortedPosts.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-white/60">
                  No articles yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}