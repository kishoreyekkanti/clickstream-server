require 'couchbase'

c = Couchbase.connect("http://localhost:8091/pools/default/buckets/clickStream")

c.set("foo", "world", :format => :plain)
c.append("foo", "!")
c.prepend("foo", "Hello, ")
c.append("foo","kishore")
puts c.get("foo")