'use client'

import { useEffect, useMemo, useState } from 'react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string | null
  hero_image_url: string | null
  gallery_images?: string[] | null
  published: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
}

type BlogForm = {
  id: string
  title: string
  slug: string
  category: string
  hero_image_url: string
  gallery_images: string[]
  excerpt: string
  content: string
  seo_title: string
  seo_description: string
  published: boolean
}

type CampaignAssets = {
  facebook: string
  gbp: string
  tiktok: string
  googleAds: string
}

const emptyForm: BlogForm = {
  id: '',
  title: '',
  slug: '',
  category: '',
  hero_image_url: '',
  gallery_images: [],
  excerpt: '',
  content: '',
  seo_title: '',
  seo_description: '',
  published: true,
}

const emptyCampaignAssets: CampaignAssets = {
  facebook: '',
  gbp: '',
  tiktok: '',
  googleAds: '',
}

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 220))
  return `${minutes} min read`
}

function buildLocalCampaignTopic(brand: string, issue: string, city: string) {
  const cleanBrand = brand.trim()
  const cleanIssue = issue.trim()
  const cleanCity = city.trim() || 'Dallas'

  if (cleanBrand && cleanIssue) {
    return `${cleanBrand} ${cleanIssue} repair in ${cleanCity}`
  }

  if (cleanIssue) {
    return `${cleanIssue} repair in ${cleanCity}`
  }

  if (cleanBrand) {
    return `${cleanBrand} fitness equipment repair in ${cleanCity}`
  }

  return ''
}

function generateFallbackCampaignAssets({
  title,
  excerpt,
  slug,
  brand,
  issue,
  city,
}: {
  title: string
  excerpt: string
  slug: string
  brand: string
  issue: string
  city: string
}): CampaignAssets {
  const cleanBrand = brand || 'fitness equipment'
  const cleanIssue = issue || 'repair issues'
  const cleanCity = city || 'Dallas'
  const url = `https://www.2eztek.com/blog/${slug || makeSlug(title)}`

  return {
    facebook: `${title}

${excerpt || `If your ${cleanBrand} equipment is dealing with ${cleanIssue}, 2EZ TEK can help.`}

We service residential and commercial fitness equipment across ${cleanCity} and the Dallas Fort Worth area.

Read more: ${url}

Need service? Call 2EZ TEK at (972) 807-7232.`,

    gbp: `${cleanBrand} repair help in ${cleanCity}. If your equipment is not working correctly, making noise, slipping, stuck, or showing errors, 2EZ TEK provides professional fitness equipment repair and maintenance service.

Call (972) 807-7232 or schedule service online.`,

    tiktok: `Your ${cleanBrand} equipment acting up? Don’t replace it before you know what’s wrong. 2EZ TEK handles fitness equipment repair across ${cleanCity}. #2EZTEK #FitnessEquipmentRepair #TreadmillRepair #DallasBusiness`,

    googleAds: `Headlines:
${cleanBrand} Repair ${cleanCity}
Fitness Equipment Repair
Treadmill Repair Near You
Book Same Week Service
2EZ TEK Repair Service

Descriptions:
Need ${cleanBrand} repair in ${cleanCity}? 2EZ TEK provides in-home fitness equipment repair, diagnostics, and maintenance.
Don’t replace expensive equipment before getting it inspected. Call 2EZ TEK for local repair service.`,
  }
}

export default function AdminBlogPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [form, setForm] = useState<BlogForm>(emptyForm)

  const [topic, setTopic] = useState('')
  const [brand, setBrand] = useState('')
  const [issue, setIssue] = useState('')
  const [city, setCity] = useState('Dallas')

  const [campaignAssets, setCampaignAssets] =
    useState<CampaignAssets>(emptyCampaignAssets)

  const [activeAssetTab, setActiveAssetTab] =
    useState<keyof CampaignAssets>('facebook')

  const [loading, setLoading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [facebookPosting, setFacebookPosting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewMode, setPreviewMode] = useState(false)

  const isEditing = Boolean(form.id)

  const categories = useMemo(() => {
    const unique = new Set<string>()

    posts.forEach((post) => {
      if (post.category) unique.add(post.category)
    })

    return Array.from(unique).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const query = search.toLowerCase().trim()

        const matchesSearch =
          !query ||
          post.title?.toLowerCase().includes(query) ||
          post.slug?.toLowerCase().includes(query) ||
          post.category?.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query)

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && post.published) ||
          (statusFilter === 'draft' && !post.published)

        const matchesCategory =
          categoryFilter === 'all' || post.category === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [posts, search, statusFilter, categoryFilter])

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((post) => post.published).length,
      drafts: posts.filter((post) => !post.published).length,
      categories: categories.length,
    }
  }, [posts, categories])

  async function uploadImage(file: File, folder = 'blog') {
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('folder', folder)

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: uploadData,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed.')
    }

    return data.url as string
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      setUploadingCover(true)
      const url = await uploadImage(file, 'blog-covers')
      updateField('hero_image_url', url)
      alert('Cover image uploaded.')
    } catch (error: any) {
      alert(error.message || 'Cover upload failed.')
    } finally {
      setUploadingCover(false)
      event.target.value = ''
    }
  }

  async function handleGalleryUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    try {
      setUploadingGallery(true)

      const uploadedUrls: string[] = []

      for (const file of files) {
        const url = await uploadImage(file, 'blog-gallery')
        uploadedUrls.push(url)
      }

      setForm((current) => ({
        ...current,
        gallery_images: [...current.gallery_images, ...uploadedUrls],
      }))

      alert(`${uploadedUrls.length} gallery image(s) uploaded.`)
    } catch (error: any) {
      alert(error.message || 'Gallery upload failed.')
    } finally {
      setUploadingGallery(false)
      event.target.value = ''
    }
  }

  function removeGalleryImage(url: string) {
    setForm((current) => ({
      ...current,
      gallery_images: current.gallery_images.filter((image) => image !== url),
    }))
  }

  function insertImageIntoContent(url: string) {
    const imageMarkdown = `

![Blog image](${url})

`

    setForm((current) => ({
      ...current,
      content: `${current.content}${imageMarkdown}`,
    }))
  }

  async function loadPosts(showSpinner = false) {
    try {
      if (showSpinner) setRefreshing(true)

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
    } catch (error) {
      console.error(error)
      alert('Unable to connect to the blog admin API.')
      setAuthorized(false)
    } finally {
      setRefreshing(false)
    }
  }

  async function login() {
    if (!password) {
      alert('Enter admin password.')
      return
    }

    await loadPosts(true)
  }

  function updateField(field: keyof BlogForm, value: string | boolean | string[]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setTopic('')
    setBrand('')
    setIssue('')
    setCity('Dallas')
    setCampaignAssets(emptyCampaignAssets)
    setPreviewMode(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function editPost(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || '',
      hero_image_url: post.hero_image_url || '',
      gallery_images: post.gallery_images || [],
      excerpt: post.excerpt || '',
      content: post.content || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      published: Boolean(post.published),
    })

    setPreviewMode(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function buildSocialCaption() {
    const url = `https://www.2eztek.com/blog/${form.slug || makeSlug(form.title)}`
    const caption = `${form.title}

${form.excerpt || 'New article from 2EZ TEK covering gym equipment repair, maintenance, and service insights.'}

Read more: ${url}

Need gym equipment repair or maintenance in Dallas?
Call 2EZ TEK: (972) 807-7232`

    navigator.clipboard.writeText(caption)
    alert('Social caption copied.')
  }

  function copyCampaignAsset(asset: keyof CampaignAssets) {
    const value = campaignAssets[asset]

    if (!value) {
      alert('No campaign asset available to copy.')
      return
    }

    navigator.clipboard.writeText(value)
    alert(`${asset.toUpperCase()} asset copied.`)
  }

  async function postFacebookAsset() {
    const message = campaignAssets.facebook.trim()

    if (!message) {
      alert('Generate or enter a Facebook campaign asset first.')
      return
    }

    const confirmed = window.confirm(
      'Publish this campaign asset to the configured Facebook Page now?'
    )

    if (!confirmed) return

    try {
      setFacebookPosting(true)

      const slug = form.slug || makeSlug(form.title)
      const response = await fetch('/api/admin/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          message,
          link: slug ? `https://www.2eztek.com/blog/${slug}` : undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.message || 'Facebook publishing failed.')
        return
      }

      alert(`Facebook post published: ${data.post.id}`)
    } catch (error) {
      console.error(error)
      alert('Something went wrong while publishing to Facebook.')
    } finally {
      setFacebookPosting(false)
    }
  }

  function applySeoDefaults() {
    const title =
      form.title ||
      topic ||
      buildLocalCampaignTopic(brand, issue, city) ||
      'Gym Equipment Repair Dallas'

    const seoTitle = `${title} | Gym Equipment Repair Dallas | 2EZ TEK`

    const seoDescription =
      form.excerpt ||
      `Learn about ${title.toLowerCase()} from 2EZ TEK, a Dallas fitness equipment repair and maintenance company.`

    setForm((current) => ({
      ...current,
      slug: current.slug || makeSlug(title),
      seo_title: current.seo_title || seoTitle,
      seo_description: current.seo_description || seoDescription,
    }))
  }

  async function generateWithAI() {
    try {
      const campaignTopic =
        topic.trim() || buildLocalCampaignTopic(brand, issue, city)

      if (!campaignTopic.trim()) {
        alert('Enter a topic, or add brand and issue first.')
        return
      }

      setAiLoading(true)

      const response = await fetch('/api/ai/blog-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: campaignTopic,
          brand,
          issue,
          city,
          requestType: 'campaign',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.message || 'AI generation failed.')
        return
      }

      const article = data.article

      const nextForm = {
        id: '',
        title: article.title || '',
        slug: article.slug || makeSlug(article.title || campaignTopic),
        category: article.category || brand || 'Fitness Equipment Repair',
        hero_image_url: article.hero_image_url || '',
        gallery_images: [],
        excerpt: article.excerpt || '',
        content: article.content || '',
        seo_title:
          article.seo_title ||
          `${article.title || campaignTopic} | Gym Equipment Repair Dallas | 2EZ TEK`,
        seo_description: article.seo_description || article.excerpt || '',
        published: true,
      }

      setForm(nextForm)

      const fallbackAssets = generateFallbackCampaignAssets({
        title: nextForm.title,
        excerpt: nextForm.excerpt,
        slug: nextForm.slug,
        brand,
        issue,
        city,
      })

      setCampaignAssets({
        facebook: data.campaign?.facebook || article.facebook || fallbackAssets.facebook,
        gbp: data.campaign?.gbp || article.gbp || fallbackAssets.gbp,
        tiktok: data.campaign?.tiktok || article.tiktok || fallbackAssets.tiktok,
        googleAds:
          data.campaign?.googleAds || article.googleAds || fallbackAssets.googleAds,
      })

      setTopic(campaignTopic)
      setPreviewMode(false)
    } catch (error) {
      console.error(error)
      alert('Something went wrong while generating.')
    } finally {
      setAiLoading(false)
    }
  }

  async function savePost() {
    try {
      if (!form.title.trim() || !form.content.trim()) {
        alert('Title and content are required.')
        return
      }

      setLoading(true)

      const cleanSlug = form.slug || makeSlug(form.title)

      const payload = {
        ...form,
        slug: cleanSlug,
        seo_title:
          form.seo_title || `${form.title} | Gym Equipment Repair Dallas | 2EZ TEK`,
        seo_description:
          form.seo_description ||
          form.excerpt ||
          `Read this 2EZ TEK guide about ${form.title.toLowerCase()} for gym equipment repair and maintenance support in Dallas.`,
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
      await loadPosts(true)
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
    await loadPosts(true)
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
        gallery_images: post.gallery_images || [],
        published: !post.published,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      alert(data.message || 'Update failed.')
      return
    }

    await loadPosts(true)
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

  async function approveDraft(post: BlogPost) {
    const response = await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ...post, published: true }),
    })
    const data = await response.json()
    if (!data.success) { alert(data.message || 'Approve failed.'); return }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: true } : p))
  }

  async function discardDraft(post: BlogPost) {
    if (!window.confirm(`Discard "${post.title}"? This deletes it permanently.`)) return
    const response = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: post.id }),
    })
    const data = await response.json()
    if (!data.success) { alert(data.message || 'Delete failed.'); return }
    setPosts(prev => prev.filter(p => p.id !== post.id))
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />

        <div className="relative mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Secure Blog CMS
          </div>

          <h1 className="mt-6 text-4xl font-black md:text-5xl">
            Admin Access
          </h1>

          <p className="mt-4 text-white/60">
            Enter your blog admin password to manage articles, campaigns, SEO,
            and publishing.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') login()
            }}
            placeholder="Admin password"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />

          <button
            onClick={login}
            disabled={refreshing}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {refreshing ? 'Checking...' : 'Enter Dashboard'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 pt-28 pb-24 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_32%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
              2EZ TEK Marketing Engine
            </div>

            <h1 className="mt-6 text-4xl font-black md:text-6xl">
              AI Campaign Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-white/65">
              Generate SEO articles, upload project images, create local posts,
              and build campaign assets from one repair topic.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadPosts(true)}
              disabled={refreshing}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={resetForm}
              className="rounded-2xl bg-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300"
            >
              New Campaign
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm font-bold text-white/50">Total Articles</div>
            <div className="mt-2 text-4xl font-black">{stats.total}</div>
          </div>

          <div className="rounded-[1.5rem] border border-cyan-400/15 bg-cyan-400/5 p-5">
            <div className="text-sm font-bold text-cyan-200/70">Published</div>
            <div className="mt-2 text-4xl font-black text-cyan-200">
              {stats.published}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-yellow-400/15 bg-yellow-400/5 p-5">
            <div className="text-sm font-bold text-yellow-100/70">Drafts</div>
            <div className="mt-2 text-4xl font-black text-yellow-100">
              {stats.drafts}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm font-bold text-white/50">Categories</div>
            <div className="mt-2 text-4xl font-black">{stats.categories}</div>
          </div>
        </div>

        {/* Pending Review */}
        {stats.drafts > 0 && (
          <div className="mb-8 rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/5 p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black">{stats.drafts}</span>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">Pending Review</h2>
              <span className="text-xs text-yellow-300/50">AI-generated posts waiting for your approval</span>
            </div>
            <div className="space-y-3">
              {posts.filter(p => !p.published).map(post => (
                <div key={post.id} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-black/30 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white leading-snug">{post.title}</p>
                    <p className="mt-1 text-sm text-white/40 line-clamp-2">{post.excerpt}</p>
                    <p className="mt-2 text-xs text-white/25">{formatDate(post.created_at)} · {post.category}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => { setForm({ id: post.id, title: post.title, slug: post.slug, category: post.category || '', hero_image_url: post.hero_image_url || '', gallery_images: post.gallery_images || [], excerpt: post.excerpt || '', content: post.content, seo_title: post.seo_title || '', seo_description: post.seo_description || '', published: post.published }) }}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => discardDraft(post)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => approveDraft(post)}
                      className="rounded-xl bg-yellow-400 px-4 py-2 text-xs font-black text-black hover:bg-yellow-300 transition-colors"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
          <section className="space-y-8 rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
            <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-6">
              <label className="mb-4 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Campaign Generator
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand: NordicTrack"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
                />

                <input
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Issue: incline not working"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
                />

                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City: Dallas"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
                />
              </div>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Optional topic override"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={generateWithAI}
                  disabled={aiLoading}
                  className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {aiLoading ? 'Generating...' : 'Generate Campaign'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-white/40">
                  Editor Mode
                </div>

                <div className="mt-1 text-lg font-black">
                  {isEditing ? 'Editing Existing Article' : 'Creating New Campaign'}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={applySeoDefaults}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
                >
                  Apply SEO Defaults
                </button>

                <button
                  onClick={() => setPreviewMode((current) => !current)}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-200"
                >
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
              </div>
            </div>

            {!previewMode ? (
              <>
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
                    placeholder="Example: Why Your Treadmill Stops Mid Workout"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                        Slug
                      </label>

                      <button
                        onClick={() => updateField('slug', makeSlug(form.title))}
                        type="button"
                        className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200 hover:text-cyan-100"
                      >
                        Regenerate
                      </button>
                    </div>

                    <input
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="treadmill-stops-mid-workout"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                      Category
                    </label>

                    <input
                      value={form.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      placeholder="Treadmill Repair"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                    Cover Image
                  </label>

                  <input
                    value={form.hero_image_url}
                    onChange={(e) => updateField('hero_image_url', e.target.value)}
                    placeholder="Paste image URL or upload below"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                  />

                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/10 p-6 text-center transition hover:bg-cyan-400/15">
                    <span className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                      {uploadingCover ? 'Uploading Cover...' : 'Upload Cover Image'}
                    </span>

                    <span className="mt-2 text-sm text-white/50">
                      JPG, PNG, WEBP supported
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>

                  {form.hero_image_url && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                      <img
                        src={form.hero_image_url}
                        alt="Cover preview"
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <label className="block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                        Project Gallery
                      </label>

                      <p className="mt-1 text-sm text-white/50">
                        Upload project photos, before and after images, or install progress shots.
                      </p>
                    </div>

                    <label className="cursor-pointer rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
                      {uploadingGallery ? 'Uploading...' : 'Upload Images'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {form.gallery_images.length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {form.gallery_images.map((url) => (
                        <div
                          key={url}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                        >
                          <img
                            src={url}
                            alt="Gallery upload"
                            className="h-32 w-full object-cover"
                          />

                          <div className="space-y-2 p-3">
                            <button
                              type="button"
                              onClick={() => insertImageIntoContent(url)}
                              className="w-full rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-black"
                            >
                              Insert In Article
                            </button>

                            <button
                              type="button"
                              onClick={() => removeGalleryImage(url)}
                              className="w-full rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/50">
                      No gallery images uploaded yet.
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                    Excerpt
                  </label>

                  <textarea
                    value={form.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    rows={4}
                    placeholder="Short summary that appears on the blog card and social post."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                      Article Content
                    </label>

                    <span className="text-xs font-bold text-white/40">
                      {estimateReadTime(form.content)}
                    </span>
                  </div>

                  <textarea
                    value={form.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    rows={20}
                    placeholder="Write or paste the full blog article here."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
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
                      placeholder="SEO title for Google"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                    />

                    <div className="mt-2 text-xs text-white/40">
                      {form.seo_title.length}/60 recommended characters
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                      SEO Description
                    </label>

                    <input
                      value={form.seo_description}
                      onChange={(e) =>
                        updateField('seo_description', e.target.value)
                      }
                      placeholder="SEO description for search results"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
                    />

                    <div className="mt-2 text-xs text-white/40">
                      {form.seo_description.length}/160 recommended characters
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
                {form.hero_image_url && (
                  <img
                    src={form.hero_image_url}
                    alt={form.title}
                    className="h-72 w-full object-cover"
                  />
                )}

                <div className="p-6 md:p-8">
                  <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                    {form.category || '2EZ TEK Blog'}
                  </div>

                  <h2 className="text-3xl font-black md:text-5xl">
                    {form.title || 'Untitled Article'}
                  </h2>

                  <p className="mt-4 text-white/60">
                    {form.excerpt || 'No excerpt added yet.'}
                  </p>

                  {form.gallery_images.length > 0 && (
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      {form.gallery_images.map((image) => (
                        <img
                          key={image}
                          src={image}
                          alt="Gallery preview"
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-6 whitespace-pre-wrap leading-8 text-white/75">
                    {form.content || 'No article content added yet.'}
                  </div>
                </div>
              </article>
            )}

            <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                    Campaign Assets
                  </div>
                  <p className="mt-1 text-sm text-white/50">
                    Copy and use these across Facebook, Google Business Profile,
                    TikTok, and Google Ads.
                  </p>
                </div>

                <button
                  onClick={() => copyCampaignAsset(activeAssetTab)}
                  className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black"
                >
                  Copy Active
                </button>

                {activeAssetTab === 'facebook' ? (
                  <button
                    onClick={postFacebookAsset}
                    disabled={facebookPosting || !campaignAssets.facebook.trim()}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-200 disabled:opacity-40"
                  >
                    {facebookPosting ? 'Posting...' : 'Post To Facebook'}
                  </button>
                ) : null}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  ['facebook', 'Facebook'],
                  ['gbp', 'GBP'],
                  ['tiktok', 'TikTok'],
                  ['googleAds', 'Google Ads'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveAssetTab(key as keyof CampaignAssets)}
                    className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                      activeAssetTab === key
                        ? 'bg-cyan-400 text-black'
                        : 'border border-white/10 bg-white/10 text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <textarea
                value={campaignAssets[activeAssetTab]}
                onChange={(e) =>
                  setCampaignAssets((current) => ({
                    ...current,
                    [activeAssetTab]: e.target.value,
                  }))
                }
                rows={10}
                placeholder="Generate a campaign to populate this asset."
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-5 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-3 text-sm font-bold text-white/80">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => updateField('published', e.target.checked)}
                />
                Published
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={buildSocialCaption}
                  disabled={!form.title}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/15 disabled:opacity-40"
                >
                  Copy Blog Caption
                </button>

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
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-3xl font-black">Article Library</h2>
                <p className="mt-2 text-sm text-white/50">
                  Search, edit, preview, publish, unpublish, or delete articles.
                </p>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | 'published' | 'draft')
                  }
                  className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-white outline-none focus:border-cyan-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-white outline-none focus:border-cyan-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-400/30"
                >
                  {post.hero_image_url && (
                    <img
                      src={post.hero_image_url}
                      alt={post.title}
                      className="mb-4 h-36 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="text-lg font-black">{post.title}</div>

                  <div className="mt-2 text-sm text-white/45">
                    /blog/{post.slug}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                        post.published
                          ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                          : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>

                    {post.category && (
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                        {post.category}
                      </span>
                    )}

                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/40">
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  {post.excerpt && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55">
                      {post.excerpt}
                    </p>
                  )}

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
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://www.2eztek.com/blog/${post.slug}`
                        )
                        alert('Blog URL copied.')
                      }}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      Copy URL
                    </button>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/60">
                  No articles match your current filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
