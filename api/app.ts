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
 * Root route
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      configurations: '/api/configurations',
      services: '/api/services',
      blog: '/api/blog',
      slides: '/api/slides',
      testimonials: '/api/testimonials',
      clients: '/api/clients',
    }
  })
})

/**
 * error handler middleware
 */
app.use(errorHandler)

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
