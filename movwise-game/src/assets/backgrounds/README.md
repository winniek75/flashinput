# Background Assets Structure

## Directory Organization

```
backgrounds/
├── space/
│   ├── earth-view.webp                  # Earth orbit panorama
│   ├── nebula-panorama.webp            # Colorful nebula field
│   ├── space-station.webp              # Space station exterior
│   └── planet-surfaces/
│       ├── sound-planet.webp           # Sound Planet surface
│       ├── word-planet.webp            # Word Planet surface
│       ├── grammar-planet.webp         # Grammar Planet surface
│       ├── mars-surface.webp           # Mars surface view
│       └── venus-atmosphere.webp       # Venus atmospheric view
└── interiors/
    ├── spaceship-cockpit.webp          # Main ship interior
    ├── control-room.webp               # Command center
    ├── laboratory.webp                 # Science lab interior
    └── corridors.webp                  # Ship hallways
```

## Required Background Images

### Space Environments (Equirectangular 360°)
- `earth-view.webp` - Earth orbit with atmospheric glow
- `nebula-panorama.webp` - Colorful nebula with stars
- `space-station.webp` - External station view
- `deep-space.webp` - Deep space with distant galaxies

### Planet Surface Backgrounds
- `sound-planet.webp` - Musical/audio themed planet
- `word-planet.webp` - Text/vocabulary themed planet  
- `grammar-planet.webp` - Structured/formal planet
- `mars-surface.webp` - Red planet landscape
- `venus-atmosphere.webp` - Thick atmospheric view

### Interior Environments
- `spaceship-cockpit.webp` - Main control area
- `control-room.webp` - Command center
- `laboratory.webp` - Research facility
- `corridors.webp` - Ship passageways

### Technical Specifications

#### WebP Format Requirements
- **Quality**: 85% for optimal size/quality balance
- **Progressive encoding**: Enabled for faster loading
- **Resolution**: 2048x1024 (standard equirectangular)
- **File size target**: < 1.5MB per image

## Image Generation Guidelines

### Equirectangular Projection
- 360° horizontal field of view
- 180° vertical field of view
- Seamless wrapping on horizontal edges
- Proper pole handling for vertical edges

### Content Requirements
- High contrast stars on dark background
- Varied star sizes and brightness
- Nebula elements for visual interest
- No obvious repeating patterns
- Realistic space environments

### Color Palettes
- **Deep Space**: Blues, purples, dark teals
- **Nebula**: Pinks, magentas, blues, purples
- **Planet Views**: Appropriate atmospheric colors
- **Starfields**: White, blue-white, yellow stars

## Usage in Components

The SpacePanorama component automatically:
1. Detects device capabilities
2. Chooses appropriate resolution
3. Implements progressive loading
4. Provides fallback images
5. Optimizes for VR viewing

## Performance Considerations

- Images are loaded progressively
- Lower resolution shown first
- Higher resolution replaces gradually
- Memory usage optimized for device
- GPU acceleration utilized where available