/* ==========================================================================
   PHARMENTIA R&D CLUB - BACKEND REST API SERVER
   Express.js + SQLite Database + JWT Auth + Full Student Profiles
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pharmentia_secret_key_2026_aiktc';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'pharmentia.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database at pharmentia.db');
    }
});

// Create/Migrate Students Table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            studentId TEXT UNIQUE NOT NULL,
            yearOfStudy TEXT NOT NULL,
            specialization TEXT DEFAULT 'Pharmaceutics',
            bio TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            passwordHash TEXT NOT NULL,
            authProvider TEXT DEFAULT 'local',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('❌ Error creating students table:', err);
        else console.log('✅ Students table ready');
    });

    // Auto Migration for existing columns
    const columnsToEnsure = [
        { name: 'specialization', type: "TEXT DEFAULT 'Pharmaceutics'" },
        { name: 'bio', type: "TEXT DEFAULT ''" },
        { name: 'avatar', type: "TEXT DEFAULT ''" }
    ];

    columnsToEnsure.forEach(col => {
        db.run(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`, () => {
            // Ignore error if column already exists
        });
    });

    // Seed Sample Student Account if Database is Empty
    db.get("SELECT COUNT(*) AS count FROM students", async (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('🌱 Seeding initial sample Pharmentia student accounts...');
            const samplePassword = await bcrypt.hash('pharmentia123', 10);
            
            const seedQuery = `INSERT INTO students (fullName, email, studentId, yearOfStudy, specialization, bio, passwordHash, authProvider) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(seedQuery, ['Ayesha Kazi', 'ayesha.kazi@aiktc.ac.in', 'AIKTC202501', '3rd Year B.Pharm', 'Pharmaceutics & Formulation', 'Founder Champion at Pharmentia R&D Club.', samplePassword, 'local']);
            db.run(seedQuery, ['Anas Memon', 'anas.memon@aiktc.ac.in', 'AIKTC202502', '3rd Year B.Pharm', 'Pharmacology & Research', 'Founder Champion at Pharmentia R&D Club.', samplePassword, 'local']);
            db.run(seedQuery, ['Tasneem Lokhandwala', 'tasneem.l@aiktc.ac.in', 'AIKTC202503', '3rd Year B.Pharm', 'Pharmaceutical Chemistry', 'Founder Champion at Pharmentia R&D Club.', samplePassword, 'local']);
            console.log('✅ Sample student accounts seeded successfully!');
        }
    });
});

// Helper function to generate JWT Token
function generateToken(student) {
    return jwt.sign(
        { 
            id: student.id, 
            email: student.email, 
            fullName: student.fullName,
            studentId: student.studentId,
            yearOfStudy: student.yearOfStudy,
            specialization: student.specialization,
            bio: student.bio,
            avatar: student.avatar
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
    );
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 1. REGISTER NEW STUDENT ACCOUNT WITH FULL PROFILE
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, studentId, yearOfStudy, specialization, bio, avatar, password } = req.body;

        if (!fullName || !email || !studentId || !yearOfStudy || !password) {
            return res.status(400).json({ error: 'Please fill in all required profile fields.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if student email or ID already exists
        db.get("SELECT * FROM students WHERE email = ? OR studentId = ?", [email.toLowerCase(), studentId.toUpperCase()], async (err, existingStudent) => {
            if (err) {
                return res.status(500).json({ error: 'Database error checking student record.' });
            }

            if (existingStudent) {
                if (existingStudent.email.toLowerCase() === email.toLowerCase()) {
                    return res.status(400).json({ error: 'A student account with this email already exists.' });
                }
                return res.status(400).json({ error: 'A student account with this Roll No / Student ID already exists.' });
            }

            // Hash Password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert New Student Profile
            const insertQuery = `
                INSERT INTO students (fullName, email, studentId, yearOfStudy, specialization, bio, avatar, passwordHash, authProvider)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'local')
            `;

            db.run(insertQuery, [
                fullName, 
                email.toLowerCase(), 
                studentId.toUpperCase(), 
                yearOfStudy, 
                specialization || 'Pharmaceutics', 
                bio || '', 
                avatar || '', 
                passwordHash
            ], function (insertErr) {
                if (insertErr) {
                    console.error('Insert error:', insertErr);
                    return res.status(500).json({ error: 'Failed to create student profile.' });
                }

                const newStudent = {
                    id: this.lastID,
                    fullName,
                    email: email.toLowerCase(),
                    studentId: studentId.toUpperCase(),
                    yearOfStudy,
                    specialization: specialization || 'Pharmaceutics',
                    bio: bio || '',
                    avatar: avatar || '',
                    authProvider: 'local'
                };

                const token = generateToken(newStudent);

                console.log(`🎉 Student Registered: ${fullName} (${studentId}) - ${yearOfStudy}`);

                return res.status(201).json({
                    message: 'Student Account & Membership Profile created successfully!',
                    token,
                    student: newStudent
                });
            });
        });
    } catch (error) {
        console.error('Registration server error:', error);
        return res.status(500).json({ error: 'Server internal error during registration.' });
    }
});

// 2. STUDENT LOGIN (EMAIL OR STUDENT ID)
app.post('/api/auth/login', (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Please enter your Email / Student ID and Password.' });
        }

        const query = "SELECT * FROM students WHERE LOWER(email) = LOWER(?) OR UPPER(studentId) = UPPER(?)";

        db.get(query, [identifier, identifier], async (err, student) => {
            if (err) {
                return res.status(500).json({ error: 'Database authentication error.' });
            }

            if (!student) {
                return res.status(401).json({ error: 'Student account not found. Please create an account first.' });
            }

            // Verify Password
            const isMatch = await bcrypt.compare(password, student.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password. Please try again.' });
            }

            const studentProfile = {
                id: student.id,
                fullName: student.fullName,
                email: student.email,
                studentId: student.studentId,
                yearOfStudy: student.yearOfStudy,
                specialization: student.specialization || 'Pharmaceutics',
                bio: student.bio || '',
                avatar: student.avatar || '',
                authProvider: student.authProvider
            };

            const token = generateToken(studentProfile);

            console.log(`🔑 Student Logged In: ${student.fullName}`);

            return res.json({
                message: `Welcome back, ${student.fullName}!`,
                token,
                student: studentProfile
            });
        });
    } catch (error) {
        console.error('Login server error:', error);
        return res.status(500).json({ error: 'Server internal error during login.' });
    }
});

// 3. SOCIAL LOGIN HANDLER (GOOGLE / FACEBOOK / APPLE)
app.post('/api/auth/social', (req, res) => {
    try {
        const { provider, name, email } = req.body;

        if (!provider || !email) {
            return res.status(400).json({ error: 'Missing social authentication data.' });
        }

        const query = "SELECT * FROM students WHERE LOWER(email) = LOWER(?)";

        db.get(query, [email], async (err, existingStudent) => {
            if (err) {
                return res.status(500).json({ error: 'Database social auth error.' });
            }

            if (existingStudent) {
                const studentProfile = {
                    id: existingStudent.id,
                    fullName: existingStudent.fullName,
                    email: existingStudent.email,
                    studentId: existingStudent.studentId,
                    yearOfStudy: existingStudent.yearOfStudy,
                    specialization: existingStudent.specialization || 'Pharmaceutics',
                    bio: existingStudent.bio || '',
                    avatar: existingStudent.avatar || '',
                    authProvider: provider
                };

                const token = generateToken(studentProfile);
                return res.json({
                    message: `Welcome back, ${existingStudent.fullName}!`,
                    token,
                    student: studentProfile
                });
            } else {
                const studentId = `SOC-${Math.floor(100000 + Math.random() * 900000)}`;
                const dummyPassword = await bcrypt.hash('social_auth_pwd', 10);
                const fullName = name || email.split('@')[0];
                const yearOfStudy = 'Pharmacy Student';
                const specialization = 'Pharmacy Research';

                const insertQuery = `
                    INSERT INTO students (fullName, email, studentId, yearOfStudy, specialization, bio, avatar, passwordHash, authProvider)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(insertQuery, [fullName, email.toLowerCase(), studentId, yearOfStudy, specialization, '', '', dummyPassword, provider], function (insertErr) {
                    if (insertErr) {
                        return res.status(500).json({ error: 'Failed to create social student profile.' });
                    }

                    const newStudent = {
                        id: this.lastID,
                        fullName,
                        email: email.toLowerCase(),
                        studentId,
                        yearOfStudy,
                        specialization,
                        bio: '',
                        avatar: '',
                        authProvider: provider
                    };

                    const token = generateToken(newStudent);

                    console.log(`🌐 Social student account created via ${provider}: ${fullName}`);

                    return res.status(201).json({
                        message: `Account created via ${provider}! Welcome to Pharmentia.`,
                        token,
                        student: newStudent
                    });
                });
            }
        });
    } catch (error) {
        console.error('Social auth server error:', error);
        return res.status(500).json({ error: 'Server error handling social auth.' });
    }
});

// 4. VERIFY LOGGED-IN STUDENT (GET /api/auth/me)
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ student: decoded });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
});

// 5. UPDATE STUDENT PROFILE (PUT /api/students/profile)
app.put('/api/students/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { fullName, yearOfStudy, specialization, bio, avatar } = req.body;

        const updateQuery = `
            UPDATE students 
            SET fullName = COALESCE(?, fullName),
                yearOfStudy = COALESCE(?, yearOfStudy),
                specialization = COALESCE(?, specialization),
                bio = COALESCE(?, bio),
                avatar = COALESCE(?, avatar)
            WHERE id = ?
        `;

        db.run(updateQuery, [fullName, yearOfStudy, specialization, bio, avatar, decoded.id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update student profile.' });
            }

            db.get("SELECT * FROM students WHERE id = ?", [decoded.id], (getErr, updatedStudent) => {
                if (getErr || !updatedStudent) {
                    return res.status(500).json({ error: 'Profile updated, error fetching record.' });
                }

                const studentProfile = {
                    id: updatedStudent.id,
                    fullName: updatedStudent.fullName,
                    email: updatedStudent.email,
                    studentId: updatedStudent.studentId,
                    yearOfStudy: updatedStudent.yearOfStudy,
                    specialization: updatedStudent.specialization,
                    bio: updatedStudent.bio,
                    avatar: updatedStudent.avatar,
                    authProvider: updatedStudent.authProvider
                };

                const newToken = generateToken(studentProfile);
                return res.json({ message: 'Profile updated successfully!', token: newToken, student: studentProfile });
            });
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }
});

// 6. GET ALL REGISTERED PHARMENTIA MEMBERS
app.get('/api/students', (req, res) => {
    db.all("SELECT id, fullName, email, studentId, yearOfStudy, specialization, bio, avatar, authProvider, createdAt FROM students ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve students list.' });
        }
        return res.json({ total: rows.length, students: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Pharmentia REST API Server running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api/auth/login`);
    console.log(`=======================================================`);
});
