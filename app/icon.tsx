import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFD84D',
          border: '4px solid #000',
          boxSizing: 'border-box',
          position: 'relative',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 14,
            width: 34,
            height: 10,
            background: '#000',
            transform: 'skewX(-20deg)',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 25,
            width: 20,
            height: 7,
            background: '#000',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 16,
            width: 2,
            height: 18,
            background: '#000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 34,
            right: 14,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#000',
          }}
        />
        <svg width="30" height="18" viewBox="0 0 30 18" fill="none" style={{ position: 'absolute', bottom: 11 }}>
          <path d="M2 2C8 2 8 16 15 16C22 16 22 2 28 2" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  )
}
