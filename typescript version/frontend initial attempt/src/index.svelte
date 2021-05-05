<script lang="ts">
  let x: BaseShipData = { id: 'asdf', name: 'hiiiii' }
  console.log('hi', x)
</script>

<div class="holder">hello {JSON.stringify(x)}</div>

<style>
  .holder {
    width: 100%;
    height: 100%;
    --text-size: 50px;
    font-size: var(--text-size);
    position: relative;
  }
</style>
