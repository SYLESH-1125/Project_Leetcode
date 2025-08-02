import fs from 'fs';

// Function to clean and normalize LeetCode IDs
function cleanLeetcodeId(id) {
  if (!id || typeof id !== 'string') return null;
  
  // Remove extra spaces and trim
  let cleaned = id.trim();
  
  // Skip empty or placeholder values
  if (cleaned === '' || 
      cleaned.includes('@citchennai.net') || 
      cleaned.length < 2 ||
      /^[A-Z0-9]{10}$/.test(cleaned)) { // Skip random generated IDs like "UZnxAiBa9a"
    return null;
  }
  
  return cleaned;
}

// Function to extract section from registration number or structure
function extractSection(regNo, sectionKey) {
  if (sectionKey && sectionKey.includes('SEC')) {
    return sectionKey.replace(' SEC', '').trim();
  }
  return null;
}

// Function to determine academic year and batch from reg number
function getAcademicInfo(regNo) {
  if (!regNo) return { year: '3rd Year', batch: 2023 }; // Default for files without reg numbers
  
  if (regNo.startsWith('24CS')) {
    return { year: '2nd Year', batch: 2024 };
  } else if (regNo.startsWith('23CS') || regNo.startsWith('213223104')) {
    return { year: '3rd Year', batch: 2023 };
  }
  
  // Default fallback
  return { year: '3rd Year', batch: 2023 };
}

async function parseStudentData() {
  const students = [];
  let studentId = 1;

  try {
    // Parse 2nd Year CSE students (II CIT CSE LEETCODE ID DETAILS.json)
    console.log('📚 Parsing 2nd Year CSE students...');
    const secondYearData = JSON.parse(fs.readFileSync('II CIT CSE  LEETCODE ID DETAILS.json', 'utf8'));
    
    for (const [sectionKey, sectionStudents] of Object.entries(secondYearData)) {
      if (Array.isArray(sectionStudents)) {
        const section = extractSection(null, sectionKey);
        
        for (const student of sectionStudents) {
          const leetcodeId = cleanLeetcodeId(student['Leet Code ID']);
          if (leetcodeId) {
            const academicInfo = getAcademicInfo(student['Reg No']);
            
            students.push({
              id: studentId++,
              leetcode_id: leetcodeId,
              display_name: student['NAME'] || leetcodeId,
              reg_no: student['Reg No'] || null,
              email: student['Official Mail Id'] || null,
              department: 'CSE',
              academic_year: academicInfo.year,
              batch_year: academicInfo.batch,
              section: section,
              active: true
            });
          }
        }
      }
    }

    // Parse 3rd Year CSE students (III CSE Leetcode ID.json)
    console.log('📚 Parsing 3rd Year CSE students (File 1)...');
    const thirdYearData1 = JSON.parse(fs.readFileSync('III CSE Leetcode ID.json', 'utf8'));
    
    for (const student of thirdYearData1) {
      const leetcodeId = cleanLeetcodeId(student['Column4']);
      if (leetcodeId && leetcodeId !== 'Leetcode ID') { // Skip header
        students.push({
          id: studentId++,
          leetcode_id: leetcodeId,
          display_name: leetcodeId, // No names in this file
          reg_no: null,
          email: null,
          department: 'CSE',
          academic_year: '3rd Year',
          batch_year: 2023,
          section: null,
          active: true
        });
      }
    }

    // Parse 3rd Year CSE students (lEETCODE ID.json)
    console.log('📚 Parsing 3rd Year CSE students (File 2)...');
    const thirdYearData2 = JSON.parse(fs.readFileSync('lEETCODE ID.json', 'utf8'));
    
    for (const student of thirdYearData2) {
      const leetcodeId = cleanLeetcodeId(student['Leetcode ID']);
      if (leetcodeId) {
        students.push({
          id: studentId++,
          leetcode_id: leetcodeId,
          display_name: leetcodeId, // No names in this file
          reg_no: null,
          email: null,
          department: 'CSE',
          academic_year: '3rd Year',
          batch_year: 2023,
          section: null,
          active: true
        });
      }
    }

    // Remove duplicates based on leetcode_id
    const uniqueStudents = [];
    const seenIds = new Set();
    
    for (const student of students) {
      if (!seenIds.has(student.leetcode_id.toLowerCase())) {
        seenIds.add(student.leetcode_id.toLowerCase());
        uniqueStudents.push(student);
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`📝 Total students found: ${students.length}`);
    console.log(`✅ Unique students after deduplication: ${uniqueStudents.length}`);
    
    const secondYearCount = uniqueStudents.filter(s => s.academic_year === '2nd Year').length;
    const thirdYearCount = uniqueStudents.filter(s => s.academic_year === '3rd Year').length;
    
    console.log(`🎓 2nd Year students: ${secondYearCount}`);
    console.log(`🎓 3rd Year students: ${thirdYearCount}`);

    // Generate SQL insert statements
    const sqlInserts = [];
    
    // Clear existing data first
    sqlInserts.push('-- Clear existing target_users data');
    sqlInserts.push('DELETE FROM target_users;');
    sqlInserts.push('ALTER SEQUENCE target_users_id_seq RESTART WITH 1;');
    sqlInserts.push('');
    
    sqlInserts.push('-- Insert 2nd Year CSE Students');
    const secondYearStudents = uniqueStudents.filter(s => s.academic_year === '2nd Year');
    for (const student of secondYearStudents) {
      const values = [
        `'${student.leetcode_id.replace(/'/g, "''")}'`,
        `'${student.display_name.replace(/'/g, "''")}'`,
        student.reg_no ? `'${student.reg_no}'` : 'NULL',
        student.email ? `'${student.email}'` : 'NULL',
        `'${student.department}'`,
        `'${student.academic_year}'`,
        student.batch_year,
        student.section ? `'${student.section}'` : 'NULL',
        student.active
      ];
      
      sqlInserts.push(`INSERT INTO target_users (leetcode_id, display_name, reg_no, email, department, academic_year, batch_year, section, active) VALUES (${values.join(', ')});`);
    }
    
    sqlInserts.push('');
    sqlInserts.push('-- Insert 3rd Year CSE Students');
    const thirdYearStudents = uniqueStudents.filter(s => s.academic_year === '3rd Year');
    for (const student of thirdYearStudents) {
      const values = [
        `'${student.leetcode_id.replace(/'/g, "''")}'`,
        `'${student.display_name.replace(/'/g, "''")}'`,
        student.reg_no ? `'${student.reg_no}'` : 'NULL',
        student.email ? `'${student.email}'` : 'NULL',
        `'${student.department}'`,
        `'${student.academic_year}'`,
        student.batch_year,
        student.section ? `'${student.section}'` : 'NULL',
        student.active
      ];
      
      sqlInserts.push(`INSERT INTO target_users (leetcode_id, display_name, reg_no, email, department, academic_year, batch_year, section, active) VALUES (${values.join(', ')});`);
    }

    // Write SQL file
    const sqlContent = sqlInserts.join('\n');
    fs.writeFileSync('insert-target-users.sql', sqlContent);
    
    // Write JSON summary for reference
    const summary = {
      total_students: uniqueStudents.length,
      second_year_count: secondYearCount,
      third_year_count: thirdYearCount,
      sections_found: [...new Set(uniqueStudents.filter(s => s.section).map(s => s.section))].sort(),
      sample_students: {
        second_year: secondYearStudents.slice(0, 5),
        third_year: thirdYearStudents.slice(0, 5)
      }
    };
    
    fs.writeFileSync('students-summary.json', JSON.stringify(summary, null, 2));
    
    console.log(`\n✅ Files generated:`);
    console.log(`📄 insert-target-users.sql - SQL insert statements`);
    console.log(`📊 students-summary.json - Summary report`);
    
    return uniqueStudents;

  } catch (error) {
    console.error('❌ Error parsing student data:', error);
    throw error;
  }
}

// Run the parser
parseStudentData()
  .then(() => {
    console.log('\n🎉 Student data parsing completed successfully!');
  })
  .catch((error) => {
    console.error('💥 Failed to parse student data:', error);
    process.exit(1);
  });

export { parseStudentData };
