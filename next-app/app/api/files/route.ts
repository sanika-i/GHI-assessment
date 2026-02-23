import { NextRequest, NextResponse } from 'next/server'
import { FileRecord, FilesResponse } from '@/lib/types'

const MOCK_DATA: FileRecord[] = [
    { id: 1, name: 'test_file.pdf', size: '2.3 MB', user: 'test@example.com', date: '2024-01-15' },
    { id: 2, name: 'test_image.png', size: '4.3 MB', user: 'test@example.com', date: '2024-01-18' },
    { id: 3, name: 'reportDoc.docx', size: '0.8 MB', user: 'test@example.com', date: '2024-01-20' },
    { id: 4, name: 'meeting-notes.txt', size: '1.1 MB', user: 'test@example.com', date: '2024-01-22' },
    { id: 5, name: 'logo-final.jpg', size: '1.8 MB', user: 'test@example.com', date: '2024-01-24' },
]

export async function GET(req: NextRequest): Promise<NextResponse<FilesResponse>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const q = req.nextUrl.searchParams.get('q')?.toLowerCase() ?? ''
    const files = q
        ? MOCK_DATA.filter(f => f.name.toLowerCase().includes(q))
        : MOCK_DATA

    return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
    const { filename } = await req.json()

    if (!filename) {
        return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    const newFile: FileRecord = {
        id: MOCK_DATA.length + 1,
        name: filename,
        size: '0.8 MB',
        user: 'test@example.com',
        date: new Date().toISOString().split('T')[0],
    }
    MOCK_DATA.push(newFile)

    return NextResponse.json({ success: true, file: newFile })
}