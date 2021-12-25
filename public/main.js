const thumbUp = document.getElementsByClassName("fa-heart");
const trash = document.getElementsByClassName('deleteBtn')


Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(e){
        let likes = Number(this.parentNode.parentNode.parentNode.parentNode.childNodes[7].innerText)
        console.log(likes)
        let postID = e.target.dataset.post
        console.log(postID)
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'likes' : likes,
            'postID' : postID
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(false)
        })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(e){
        let key = e.target.dataset.key
        console.log(key)
        fetch('deletePost', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'key': key
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
