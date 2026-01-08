<template>
  <div style="width: 100vw; height: 100vh;">
    <TresCanvas>
      <TresPerspectiveCamera :position="[3, 3, 3]" />
      <TresAmbientLight />
      <TresMesh>
        <TresBoxGeometry />
        <TresMeshNormalMaterial />
      </TresMesh>
      <OrbitControls />
    </TresCanvas>
  </div>
</template>

<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
</script>