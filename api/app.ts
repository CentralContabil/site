/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import slidesRoutes from './routes/slides.js'
import servicesRoutes from './routes/services.js'
import testimonialsRoutes from './routes/testimonials.js'
import configurationRoutes from './routes/configuration.js'
import blogRoutes from './routes/blogRoutes.js'
import heroRoutes from './routes/hero.js'
import sectionsRoutes from './routes/sections.js'
import newsletterRoutes from './routes/newsletter.js'
import clientsRoutes from './routes/clients.js'
import contactMessagesRoutes from './routes/contactMessages.js'
import privacyPolicyRoutes from './routes/privacyPolicy.js'
import categoryRoutes from './routes/categoryRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import loginPageRoutes from './routes/loginPageRoutes.js'
import accessLogsRoutes from './routes/accessLogs.js'
import jobApplicationsRoutes from './routes/jobApplications.js'
import jobPositionsRoutes from './routes/jobPositions.js'
import recruitmentRoutes from './routes/recruitment.js'
import careersPageRoutes from './routes/careersPageRoutes.js'
import landingPagesRoutes from './routes/landingPages.js'
import formsRoutes from './routes/forms.js'
import { errorHandler } from './middleware/errorHandler.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

// Serve static files from dist directory (frontend build)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/slides', slidesRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/testimonials', testimonialsRoutes)
app.use('/api/configurations', configurationRoutes)
app.use('/api', blogRoutes)
app.use('/api/hero', heroRoutes)
app.use('/api/sections', sectionsRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/contact-messages', contactMessagesRoutes)
app.use('/api/privacy-policy', privacyPolicyRoutes)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use('/api/login-page', loginPageRoutes)
app.use('/api/access-logs', accessLogsRoutes)
app.use('/api/job-applications', jobApplicationsRoutes)
app.use('/api/job-positions', jobPositionsRoutes)
app.use('/api/recruitment', recruitmentRoutes)
app.use('/api/careers-page', careersPageRoutes)
app.use('/api', landingPagesRoutes)
app.use('/api', formsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * Serve frontend (SPA) - must be after API routes
 * This handles all non-API routes and serves the React app
 */
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next()
  }
  
  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(__dirname, '../dist/index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(404).json({
        success: false,
        error: 'Frontend not found. Make sure dist/ folder exists and contains index.html',
      })
    }
  })
})

/**
 * error handler middleware
 */
app.use(errorHandler)

/**
 * 404 handler for API routes only
 */
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  })
})

export default app
