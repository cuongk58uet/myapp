<script>
	$(document).ready(function(){
		$("#btnAddPost").click(function(){
			$("#contentPost").val().replace(/\n/g, '<br/>');
		});
	});
</script>